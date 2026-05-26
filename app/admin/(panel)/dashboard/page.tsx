'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { DashboardKPIs } from '@/types';

const COLORS = ['#ff7a00', '#2ecc71', '#3498db', '#e74c3c', '#9b59b6'];

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [charts, setCharts] = useState<Record<string, unknown[]>>({});

  useEffect(() => {
    fetch('/api/dashboard?type=kpis').then((r) => r.json()).then(setKpis);
    fetch('/api/dashboard?type=charts').then((r) => r.json()).then(setCharts);
  }, []);

  const kpiCards = kpis
    ? [
        { label: 'OTs del mes', value: kpis.otsMes },
        { label: 'Ingresos del mes', value: formatCurrency(kpis.ingresosMes) },
        { label: 'Stock bajo', value: kpis.stockBajo, alert: kpis.stockBajo > 0 },
        { label: 'Clientes hoy', value: kpis.clientesHoy },
        { label: 'Por vencer (30d)', value: kpis.porVencer },
      ]
    : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpiCards.map((k) => (
          <Card key={k.label} className={k.alert ? 'border-red-500/50' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{k.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Ingresos diarios</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={(charts.ingresosDiarios as { fecha: string; monto: number }[]) || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="monto" stroke="#ff7a00" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Servicios más realizados</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(charts.serviciosTop as { nombre: string; cantidad: number }[]) || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="nombre" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#ff7a00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Estado del stock</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={(charts.stockEstado as { name: string; value: number }[]) || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {((charts.stockEstado as { name: string; value: number }[]) || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>OTs por estado</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={(charts.otEstados as { estado: string; cantidad: number }[]) || []}
                  dataKey="cantidad"
                  nameKey="estado"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {((charts.otEstados as { estado: string; cantidad: number }[]) || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Productos más usados</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={(charts.productosTop as { nombre: string; cantidad: number }[]) || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" />
                <YAxis dataKey="nombre" type="category" width={120} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#2ecc71" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Ganancia vs costo</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(charts.gananciaVsCosto as { ot: string; ingreso: number; costo: number }[]) || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="ot" />
                <YAxis />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="ingreso" fill="#ff7a00" stackId="a" />
                <Bar dataKey="costo" fill="#e74c3c" stackId="a" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
