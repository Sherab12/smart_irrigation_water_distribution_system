"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Navbar from "../../components/navbar";

interface Field {
    fieldName: string;
    fieldSize: string;
}

interface Source {
    name: string;
    flowSensors: { name: string }[];
    pressureSensors: { name: string }[];
    valves: { name: string }[];
}

export default function SettingsPage() {
    const [fields, setFields] = useState<Field[]>([]);
    const [sources, setSources] = useState<Source[]>([]);
    const [selectedTab, setSelectedTab] = useState<'fields' | 'sources'>('fields');
    const [selectedItem, setSelectedItem] = useState<Field | Source | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fieldResponse = await axios.get("/api/field");
                const sourceResponse = await axios.get("/api/source");

                setFields(fieldResponse.data.data.map(({ fieldName, fieldSize }) => ({ fieldName, fieldSize })));
                
                const sourcesArray = Object.keys(sourceResponse.data).map((key) => ({
                    name: key,
                    flowSensors: sourceResponse.data[key].flowSensors.map(({ name }) => ({ name })) || [],
                    pressureSensors: sourceResponse.data[key].pressureSensors.map(({ name }) => ({ name })) || [],
                    valves: sourceResponse.data[key].valves.map(({ name }) => ({ name })) || []
                }));
                setSources(sourcesArray);
            } catch (error) {
                toast.error("Error fetching data.");
            }
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        if (!selectedItem) return;
        try {
            await axios.put(`/api/${selectedTab}/${'name' in selectedItem ? selectedItem.name : selectedItem.fieldName}`, selectedItem);
            toast.success("Saved successfully");
        } catch (error) {
            toast.error("Failed to save");
        }
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        try {
            await axios.delete(`/api/${selectedTab}/${'name' in selectedItem ? selectedItem.name : selectedItem.fieldName}`);
            toast.success("Deleted successfully");
            setSelectedItem(null);
            setFields(fields.filter(f => f !== selectedItem));
            setSources(sources.filter(s => s !== selectedItem));
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="flex">
            <Navbar activePage="settings" />
            <div className="flex flex-col ml-56 items-start min-h-screen w-full p-6 bg-gray-50 shadow-lg rounded-md m-4">
                <div className="flex space-x-8 text-lg border-b-2 pb-2 w-full">
                    <span 
                        className={`cursor-pointer ${selectedTab === 'fields' ? 'text-blue-700 font-bold' : 'text-gray-700'}`} 
                        onClick={() => setSelectedTab('fields')}>Fields</span>
                    <span 
                        className={`cursor-pointer ${selectedTab === 'sources' ? 'text-blue-700 font-bold' : 'text-gray-700'}`} 
                        onClick={() => setSelectedTab('sources')}>Sources</span>
                </div>
                <div className="w-full max-w-4xl mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(selectedTab === 'fields' ? fields : sources).map((item) => (
                            <div key={'name' in item ? item.name : item.fieldName} 
                                className="p-4 border rounded-md shadow-sm bg-white cursor-pointer hover:bg-gray-100"
                                onClick={() => setSelectedItem(item)}>
                                <h3 className="font-semibold">{'name' in item ? item.name : item.fieldName}</h3>
                            </div>
                        ))}
                    </div>
                </div>
                {selectedItem && (
                    <div className="mt-6 p-4 bg-white shadow-md rounded-md w-full max-w-2xl">
                        <h2 className="text-xl font-semibold mb-2">Edit {selectedTab === 'fields' ? 'Field' : 'Source'}</h2>
                        <div className="mb-4">
                            {Object.entries(selectedItem).map(([key, value]) => (
                                <div key={key} className="mb-2">
                                    <label className="block text-sm font-medium">{key}</label>
                                    <input 
                                        className="w-full p-2 border rounded-md" 
                                        value={value} 
                                        onChange={(e) => setSelectedItem({ ...selectedItem, [key]: e.target.value })} 
                                    />
                                </div>
                            ))}
                        </div>
                        <button className="bg-green-500 text-white px-4 py-2 rounded-md mr-2" onClick={handleSave}>Save</button>
                        <button className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={handleDelete}>Delete</button>
                    </div>
                )}
            </div>
        </div>
    );
}