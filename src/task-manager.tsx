import { useState, useEffect } from "react";
import { supabase } from "./supabase-client.ts";
import "./App.css";


// Define the Task type
  interface Task {
    id: number;
    title: string;
    description: string;
    image_url?: string | null;
    video_url?: string | null;
  }


  export default function App() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState({ title: "", description: "" });
    const [newDescription, setNewDescription] = useState("");


    const [taskImage, setTaskImage] = useState<File | null>(null);
    const [taskVideo, setTaskVideo] = useState<File | null>(null);


// --- READ TASKS ---
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("id", { ascending: false });


    if (error) console.error("Read error:", error.message);
    else setTasks(data as Task[]);
  };


// --- DELETE TASK ---
  const deleteTask = async (id: number) => {
    if (!window.confirm("Delete this task?")) return;


    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) console.error("Delete error:", error.message);
    else {
      console.log(" Task deleted");
      fetchTasks();
    }
  };
 
// --- UPDATE TASK ---
  const updateTask = async (id: number) => {
    const { error } = await supabase
      .from("tasks")
      .update({ description: newDescription })
      .eq("id", id);


    if (error) console.error("Update error:", error.message);
    else {
      console.log(" Task updated");
      setNewDescription("");
      fetchTasks();
    }
  };


//---------------------- IMAGE & VIDEO ----------------------------------//
 
//  Ensure Supabase has an anonymous session
  useEffect(() => {
    const init = async () => {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) console.error("Auth error:", error.message);
      else console.log(" Anonymous session active");
    };
    init();
  }, []);


// --- UPLOAD FILE TO SUPABASE STORAGE ---
  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    try {
      const filePath = `${folder}/${Date.now()}-${file.name}`;


// Upload the file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("notes-images") // bucket name
    .upload(filePath, file, { upsert: true });


  if (uploadError) {
    console.error(" Upload error:", uploadError.message);
    return null;
  }


// Get the public URL after upload
  const { data } = supabase.storage
    .from("notes-images")
    .getPublicUrl(filePath);


  if (!data?.publicUrl) {
    console.error(" No public URL returned:", data);
    return null;
  }


    console.log(" Uploaded file URL:", data.publicUrl);
    return data.publicUrl;
  } catch (err) {
    console.error("Unexpected upload error:", err);
    return null;
  }
  };


// --- HANDLERS ---
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTaskImage(e.target.files[0]);
    }
  };


  const handleVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTaskVideo(e.target.files[0]);
    }
  };


// --- CREATE TASK ---
  const createTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();


    let imageUrl: string | null = null;
    let videoUrl: string | null = null;


    if (taskImage) imageUrl = await uploadFile(taskImage, "images");
    if (taskVideo) videoUrl = await uploadFile(taskVideo, "videos");


    const { error } = await supabase.from("tasks").insert([
      {
        title: newTask.title,
        description: newTask.description,
        image_url: imageUrl,
        video_url: videoUrl,
      },
    ]);


    if (error) {
      console.error(" Insert error:", error.message);
    } else {
      console.log(" Task added successfully!");
      setNewTask({ title: "", description: "" });
      setTaskImage(null);
      setTaskVideo(null);
      fetchTasks();
    }
  };


// --- INITIAL LOAD ---
  useEffect(() => {
    fetchTasks();


    const channel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => fetchTasks()
      )
      .subscribe();


    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  return (
    <div className="App-Container" style={{maxWidth: '600px', margin: '0 auto', padding: '1rem '}}>
      <h2 className="text-3xl font-bold underline">Mapula Supabase Project</h2>


{/* ----------------------------------From to add new task--------------------------------------------------- */}
      <form onSubmit={createTask}>
        <input
          type="text"
          placeholder="Title Here" // --- TASK TITLE ---
          value={newTask.title}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, title: e.target.value }))
          }
          required
          style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
        />


        <textarea
          placeholder="Description Here" // --- TASK DESCRIPTION ---
          value={newTask.description}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, description: e.target.value }))
          }
          required
          style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
        />


          {/* --- IMAGE AND VIDEO --- */}
        <input type="file" accept="image/*" onChange={handleImage} required />
        <input type="file" accept="video/*" onChange={handleVideo} required />


        <button type="submit" style={{ padding: '0.5rem 1 rem'}}>Add Task</button>
      </form>


          {/* --- lIST OF TASK --- */}
      <ul style={{ listStyle: 'none', padding: '0'}}>
        {tasks.map((task) => (
          <li key={task.id}
            style={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '1rem',
            marginBottom: '0.5rem'
          }}>
            <div>
              <h1>{task.title}</h1>
              <p>{task.description}</p>


              {task.image_url && (
                <img
                  src={task.image_url}
                  alt="Uploaded"
                  width="320"
                 style={{ borderRadius: "10px", marginTop: "10px" }} />
              )}


              {task.video_url && (
                <video
                  src={task.video_url}
                  controls
                  width="320"
                  style={{ marginTop: "10px", borderRadius: "10px" }} />
              )}


              <textarea
                placeholder="Edit description here"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />


              <button style={{ padding: '0.5rem 1 rem', marginRight: '0.5rem'}} onClick={() => updateTask(task.id)}>Update</button>
              <button style={{ padding: '0.5rem 1rem'}} onClick={() => deleteTask(task.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

