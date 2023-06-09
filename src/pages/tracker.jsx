import React, { useEffect, useState } from "react";
import { plus_blue, playButton, deleteIcon, close_icon } from "../assets";
import { readTaskRequest, createTaskRequest, deleteTaskRequest, updateTaskRequest } from "../api";
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ProjectWindow, Timer } from "../components";
import { useStateContext } from "../contexts/ContextProvider";

const tracker = () => {
    const [text, setText] = useState('');
    const [time, setTime] = useState(new Date().setUTCHours(0, 0, 0, 0));
    const {openProjectWindow, setOpenProjectWindow} = useStateContext();
    const [mainProject, setMainProject] = useState();
    const [id, setId] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const {isLoading, data: tasks} = useQuery('tasks',
        readTaskRequest
    );
    const queryClient = useQueryClient();
    const { mutate: createTask } = useMutation(
        (newTask) => createTaskRequest(newTask),{
            onSettled: () => {
                queryClient.invalidateQueries('tasks');
            },
        }
    );
    const { mutate: deleteTask } = useMutation(
        (newTask) => deleteTaskRequest(newTask),{
            onSettled: () => {
                queryClient.invalidateQueries('tasks');
            },
        }
    );
    const { mutate: updateTask } = useMutation(
        (updatedTask) => updateTaskRequest(updatedTask), {
            onSettled: () => {
                queryClient.invalidateQueries('tasks');
            },
        }
    );
    const handleProjectClick = (selectedProject) => {
        if(id){
            for(const task of tasks){
                if(task._id === id){
                    task.project = selectedProject
                }
            }
        }
        else
            setMainProject(selectedProject);
    };

    // useEffect(() => {
    //     readProjectRequest().then(allProjects => 
    //         console.log(allProjects))
    // })
    return (
        // Create
        <div className="bg-slate-100 h-screen overflow-hidden">
            <div className="border border-gray-300 my-9 mx-5 bg-white shadow-lg overflow-hidden"> 
                <div className="m-3 flex gap-5 items-center justify-between text-sm">
                    <input onChange={e => setText(e.target.value)} value={text} className="w-8/12 focus:border hover:border hover:border-gray-300 border border-transparent focus:border-gray-300 focus:outline-none p-2 placeholder:text-xs" type="text" placeholder="What are you working on?">
                    </input>
                    <div onClick={() => {setOpenProjectWindow(true); setId('')}} className="flex gap-2 hover:cursor-pointer hover:underline">
                        {mainProject ?
                            <p className="hover:underline truncate text-red-400"> {mainProject} </p>
                            :
                            <div className="hover:text-blue-500 text-blue-400 flex gap-2">
                                <img src={plus_blue} alt="plus"/>
                                Project
                            </div>
                        }
                    </div>
                    
                    <div className="gap-5 flex items-center mx-5">
                        <Timer isRunning={isRunning} time={time} setTime={setTime}/>
                        
                        {isRunning ?
                            <button type="submit" onClick={() => {
                                setIsRunning(false); 
                                setTime(new Date().setUTCHours(0, 0, 0, 0))
                                if(text){
                                    createTask({text, time, project: mainProject});
                                    setText('');
                                    setMainProject('');
                                }
                            }} className="bg-red-400 text-white px-5 py-2">STOP</button>
                            :<button onClick={() => {setIsRunning(true)}} className="bg-blue-400 text-white px-5 py-2">START</button>
                        }  
                    </div>
                </div>
            </div>
            {/* Task list */}
            <div className="border border-gray-300 my-9 mx-5 bg-white flex-col">
                {isLoading ? (<div> Loading... </div> ): ( 
                    tasks.map((task) => (
                        <div className="border-b border-b-gray-300 flex gap-5 justify-between p-3 items center hover:shadow-[0_0px_20px_rgba(0,0,0,0.15)]" key={task._id}> 
                            <div className="flex gap-2 items-center">
                                <input onChange={e => {task.text = e.target.value; updateTask(task)}} value={task.text} className="w-fit focus:border hover:border hover:border-gray-300 border border-transparent focus:border-gray-300 focus:outline-none p-2 placeholder:text-xs" type="text" placeholder="What are you working on?">
                                </input>
                                <div onClick={() => {setOpenProjectWindow(true); setId(task._id)}} className="flex gap-2 hover:cursor-pointer hover:underline">
                                    {task.project ?
                                        <p className="hover:text-red-500 text-red-400 truncate"> {task.project} </p>
                                        :
                                        <div className="hover:text-blue-500 text-blue-400 flex gap-2">
                                            <img src={plus_blue} alt="plus"/>
                                            Project
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className="gap-2 flex text-blue-400 text-sm items-center mx-5 justify-end">
                                    <Timer isRunning={false} time={Date.parse(task.time)} />
                                    <button onClick={() => {
                                        setTime(Date.parse(task.time));
                                        setText(task.text);
                                        setMainProject(task.project);
                                        setIsRunning(true);
                                        }}><img src={playButton} alt="play"/></button>
                                    <button onClick={() => deleteTask(task)}><img src={deleteIcon} alt="delete"/></button>
                            </div>
                        </div>)
                    )
                )
                }
            </div>
            {openProjectWindow && <ProjectWindow handleProjectClick={handleProjectClick}/>}
        </div>
    )
}

export default tracker;