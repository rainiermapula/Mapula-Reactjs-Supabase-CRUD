import { useEffect, useState } from 'react';
import './App.css';
import { Auth } from './auth';
import TaskManager from './task-manager';
import { supabase } from './supabase-client';


function App() {
  const [session, setSession] = useState<any>(null);


  const fetchSession = async () => {
    const currentSession = await supabase.auth.getSession();
    console.log(currentSession);
    setSession(currentSession.data.session);
  };


  useEffect(() => {
    fetchSession();




  },[]);


  const logout = async () => {
    await supabase.auth.signOut();
  }


  return (
    <>
      {session ? (
      <>
        <button onClick={logout}>Log Out</button>
        <TaskManager />
      </>
        ) : (
           <Auth />
        )}
        </>
    )}


export default App;
