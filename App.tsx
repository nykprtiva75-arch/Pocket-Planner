
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import RoomManager from './components/RoomManager';
import Auth from './components/Auth';
import Insights from './components/Insights';
import { User, Expense, Room, Category, AppState, RoomMember } from './types';
import { DEFAULT_CATEGORIES } from './constants';
import { db } from './services/persistenceService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const active = localStorage.getItem('pp_active_session');
    return active ? JSON.parse(active) : null;
  });

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  // Sync session and initial data load
  useEffect(() => {
    if (user) {
      localStorage.setItem('pp_active_session', JSON.stringify(user));
      const data = db.getUserData(user.id);
      setExpenses(data.expenses);
      setRooms(db.getRooms()); // We load all rooms and filter in views or logic
    } else {
      localStorage.removeItem('pp_active_session');
      setExpenses([]);
      setRooms([]);
    }
  }, [user]);

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
  };

  const logout = () => {
    setUser(null);
  };

  const addExpense = (expense: Expense) => {
    const newExpenses = [expense, ...expenses];
    setExpenses(newExpenses);
    
    // Persist to "DB"
    const allExpenses = db.getExpenses();
    db.saveExpenses([expense, ...allExpenses]);
  };

  const updatePocketMoney = (amount: number, savingsPercent: number) => {
    if (!user) return;
    const updatedUser = { ...user, pocketMoney: amount, savingsGoalPercent: savingsPercent };
    setUser(updatedUser);
    db.saveUser(updatedUser);
  };

  const addRoom = (roomName: string) => {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRoom: Room = {
      id: Math.random().toString(36).substr(2, 9),
      name: roomName,
      inviteCode,
      members: [{ userId: user?.id || '', name: user?.name || 'Owner', spent: 0 }],
      sharedExpenses: []
    };
    
    const updatedRooms = [...db.getRooms(), newRoom];
    db.saveRooms(updatedRooms);
    setRooms(updatedRooms);
  };

  const joinRoom = (inviteCode: string) => {
    const allRooms = db.getRooms();
    const roomToJoin = allRooms.find(r => r.inviteCode === inviteCode.toUpperCase());
    
    if (roomToJoin) {
      if (roomToJoin.members.some(m => m.userId === user?.id)) return "Already in room";
      
      const newMember: RoomMember = { userId: user!.id, name: user!.name, spent: 0 };
      const updatedRooms = allRooms.map(r => 
        r.id === roomToJoin.id ? { ...r, members: [...r.members, newMember] } : r
      );
      
      db.saveRooms(updatedRooms);
      setRooms(updatedRooms);
      return "Success";
    }
    return "Room not found";
  };

  const addRoomExpense = (roomId: string, expense: Expense) => {
    const allRooms = db.getRooms();
    const updatedRooms = allRooms.map(r => {
      if (r.id === roomId) {
        const updatedMembers = r.members.map(m => 
          m.userId === expense.userId ? { ...m, spent: m.spent + expense.amount } : m
        );
        return {
          ...r,
          members: updatedMembers,
          sharedExpenses: [expense, ...r.sharedExpenses]
        };
      }
      return r;
    });

    db.saveRooms(updatedRooms);
    setRooms(updatedRooms);

    // If you are the payer, sync to personal
    if (expense.userId === user?.id) {
      const personalRecord: Expense = {
        ...expense,
        id: `shared_sync_${expense.id}`,
        description: `🤝 ${expense.description}`,
        isShared: true
      };
      addExpense(personalRecord);
    }
  };

  const addCategory = (cat: Category) => {
    setCategories(prev => [...prev, cat]);
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar logout={logout} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={
              <Dashboard 
                user={user} 
                expenses={expenses} 
                categories={categories}
                onAddExpense={addExpense}
                onUpdateSettings={updatePocketMoney}
                onAddCategory={addCategory}
              />
            } />
            <Route path="/room" element={
              <RoomManager 
                rooms={rooms.filter(r => r.members.some(m => m.userId === user.id))} 
                user={user}
                expenses={expenses}
                onAddRoom={addRoom}
                onJoinRoom={joinRoom}
                onAddRoomExpense={addRoomExpense}
              />
            } />
            <Route path="/insights" element={
              <Insights user={user} expenses={expenses} />
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
