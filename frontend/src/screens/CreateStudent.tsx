import React, { useState } from 'react';

type FormState = {
    name: string;
    email: string;
    password: string;
    assigned_teacher_id?: number | null;
};

export default function CreateStudent() {
    const [form, setForm] = useState<FormState>({
        name: '',
        email: '',
        password: '',
        assigned_teacher_id: null,
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setMsg(null);

        if (!form.name.trim() || !form.email.trim()) {
            setErr('Name and email are required');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const body = await res.json();
            if(res.status === 201) {
                setMsg(`Student ${body.name} created successfully`);
                setForm({ name: '', email: '', password: '', assigned_teacher_id: null });
            } else {
                setErr(body.error || 'Failed to create student');
            }
        } catch (error) {
            setErr('Network error: could not reach server');
        } finally {
            setLoading(false);
        }  
    }

    return (
        <form onSubmit={onSubmit} aria-label="Crear estudiante">
            <div>
                <label>Nombre*</label>
                <input name="name" value={form.name} onChange={onChange} required />
            </div>
            <div>
                <label>Email*</label>
                <input name="email" type="email" value={form.email} onChange={onChange} required />
            </div>
            <div>
                <label>Contraseña</label>
                <input name="password" type="password" value={form.password} onChange={onChange} />
            </div>
            <button type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear Estudiante'}</button>
            {msg && <div role="status" style={{ color: 'green' }}>{msg}</div>}
            {err && <div role="alert" style={{ color: 'red' }}>{err}</div>}
        </form>
    );
}