/*
import React, { useEffect, useState} from "react";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export default function TestUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);

    const API_URL = 'http://172.21.11.117:5000';

    // load users
    useEffect(() => {
        fetch(`${API_URL}/users`)
            .then(res => res.json())
            .then(setUsers)
            .catch(err => console.error('Error fetching users:', err));
    }, []);

    const handleEdit = async (userId: number) => {
        const res = await fetch(`${API_URL}/users/${userId}`);

        if (!res.ok) {
            alert('Error fetching user details');
            return;
        }

        const user = await res.json();
        setSelectedUser(user);
        setFormData({ name: user.name, email: user.email });
    };

    const handleSave = async () => {
        if(!formData.name || !formData.email) {
            alert('Name and email are required');
            return;
        }

        setLoading(true);
        const res = await fetch(`${API_URL}/users/${selectedUser?.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        setLoading(false);

        if (res.ok) {
            alert('User updated successfully');
            setSelectedUser(null);
            // Refresh user list
            const updatedUsers = await fetch(`${API_URL}/users`).then(res => res.json());
            setUsers(updatedUsers);
        } else {
            const error = await res.json();
            alert(error.error || 'Error updating user');
        }

        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Test Users Management</h2>

                {!selectedUser && (
                    <table className="border-collapse border border-gray-300 w-full text-left">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2">ID</th>
                                <th className="border p-2">Name</th>
                                <th className="border p-2">Email</th>
                                <th className="border p-2">Role</th>
                                <th className="border p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="border p-2">{user.id}</td>
                                    <td className="border p-2">{user.name}</td>
                                    <td className="border p-2">{user.email}</td>
                                    <td className="border p-2">{user.role}</td>
                                    <td className="border p-2">
                                        <button
                                            onClick={() => handleEdit(user.id)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        >
                                            Edit perfil
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {selectedUser && (
                    <div className="border rounded-lg p-6 shadow-md max-w-md mx-auto">
                        <h3 className="text-xl font-semibold mb-4">
                            Edit User ID: {selectedUser.id}
                        </h3>
                        <label className="block mb-2">
                            Name:
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => 
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="border p-2 w-full mt-1"
                                required
                            />
                        </label>

                        <label className="block mb-4">
                            Email:
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                className="border p-2 w-full mt-1"
                                required
                            />
                        </label>

                        <div className="flex justify-between mt-4">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )
    };
}
*/

import React, { useEffect, useState } from "react";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export default function TestUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ name: "", email: "" });
    const [loading, setLoading] = useState(false);

    const API_URL = "http://172.21.11.117:5000";

    // Cargar usuarios
    useEffect(() => {
        fetch(`${API_URL}/users`)
        .then((res) => res.json())
        .then(setUsers)
        .catch((err) => console.error("Error fetching users:", err));
    }, []);

    const handleEdit = async (userId: number) => {
        const res = await fetch(`${API_URL}/users/${userId}`);

        if (!res.ok) {
        alert("Error fetching user details");
        return;
        }

        const user = await res.json();
        setSelectedUser(user);
        setFormData({ name: user.name, email: user.email });
    };

    const handleSave = async () => {
        if (!formData.name || !formData.email) {
        alert("Name and email are required");
        return;
        }

        setLoading(true);
        const res = await fetch(`${API_URL}/users/${selectedUser?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        });
        setLoading(false);

        if (res.ok) {
        alert("User updated successfully");
        setSelectedUser(null);
        // Refrescar lista
        const updatedUsers = await fetch(`${API_URL}/users`).then((res) =>
            res.json()
        );
        setUsers(updatedUsers);
        } else {
        const error = await res.json();
        alert(error.error || "Error updating user");
        }
    };

    return (
        <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Gestión de Usuarios</h2>

        {!selectedUser && (
            <table className="border-collapse border border-gray-300 w-full text-left">
            <thead>
                <tr className="bg-gray-100">
                <th className="border p-2">ID</th>
                <th className="border p-2">Nombre</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Rol</th>
                <th className="border p-2">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user) => (
                <tr key={user.id}>
                    <td className="border p-2">{user.id}</td>
                    <td className="border p-2">{user.name}</td>
                    <td className="border p-2">{user.email}</td>
                    <td className="border p-2">{user.role}</td>
                    <td className="border p-2">
                    <button
                        onClick={() => handleEdit(user.id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Editar perfil
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        )}

        {selectedUser && (
            <div className="border rounded-lg p-6 shadow-md max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-4">
                Editar usuario ID: {selectedUser.id}
            </h3>
            <label className="block mb-2">
                Nombre:
                <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                }
                className="border p-2 w-full mt-1"
                required
                />
            </label>

            <label className="block mb-4">
                Email:
                <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                }
                className="border p-2 w-full mt-1"
                required
                />
            </label>

            <div className="flex justify-between mt-4">
                <button
                onClick={handleSave}
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                {loading ? "Guardando..." : "Guardar"}
                </button>
                <button
                onClick={() => setSelectedUser(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                Cancelar
                </button>
            </div>
            </div>
        )}
        </div>
    );
}
