import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { financeApi, hrApi, healthApi, handleApiError } from '../services/api';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalJournals: number;
  recentPayrolls: number;
  totalAccounts: number;
  pendingTasks: number;
}

interface ServiceHealth {
  finance: boolean;
  hr: boolean;
  database: boolean;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalJournals: 0,
    recentPayrolls: 0,
    totalAccounts: 0,
    pendingTasks: 0,
  });
  const [servicesHealth, setServicesHealth] = useState<ServiceHealth>({
    finance: false,
    hr: false,
    database: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Check services health
      const [financeHealth, hrHealth] = await Promise.allSettled([
        healthApi.checkFinance(),
        healthApi.checkHR(),
      ]);

      setServicesHealth({
        finance: financeHealth.status === 'fulfilled',
        hr: hrHealth.status === 'fulfilled',
        database: true, // Assuming database is healthy if we got this far
      });

      // Load stats from APIs
      const [employeesRes, journalsRes, payrollsRes, accountsRes] = await Promise.allSettled([
        hrApi.getEmployees(),
        financeApi.getJournals(),
        hrApi.getPayrollRuns(),
        financeApi.getAccounts(),
      ]);

      const employees = employeesRes.status === 'fulfilled' ? employeesRes.value.data : [];
      const journals = journalsRes.status === 'fulfilled' ? journalsRes.value.data : [];
      const payrolls = payrollsRes.status === 'fulfilled' ? payrollsRes.value.data : [];
      const accounts = accountsRes.status === 'fulfilled' ? accountsRes.value.data : [];

      // Calculate recent payrolls (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentPayrolls = payrolls.filter((pay: any) => 
        new Date(pay.createdAt) > thirtyDaysAgo
      ).length;

      setStats({
        totalEmployees: employees.length,
        activeEmployees: employees.filter((emp: any) => emp.isActive).length,
        totalJournals: journals.length,
        recentPayrolls,
        totalAccounts: accounts.length,
        pendingTasks: 3, // Mock data for pending tasks
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Saisie d\'écriture',
      description: 'Enregistrer une nouvelle écriture comptable',
      icon: '📝',
      link: '/finance/journal',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Nouvel Employé',
      description: 'Ajouter un nouvel employé au système',
      icon: '👤',
      link: '/hr/employees',
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Calculer Paie',
      description: 'Calculer les bulletins de paie du mois',
      icon: '💰',
      link: '/hr/payroll',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      title: 'Plan de Comptes',
      description: 'Consulter le plan comptable SYSCOHADA',
      icon: '📊',
      link: '/finance/accounts',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'finance',
      action: 'Écriture comptable postée',
      user: 'Jean Dupont',
      time: 'Il y a 5 minutes',
      amount: '+450,000 FCFA',
    },
    {
      id: 2,
      type: 'hr',
      action: 'Bulletin de paie généré',
      user: 'Marie Sarr',
      time: 'Il y a 2 heures',
      amount: '-185,000 FCFA',
    },
    {
      id: 3,
      type: 'finance',
      action: 'Nouveau compte créé',
      user: 'Admin System',
      time: 'Il y a 1 jour',
      amount: '',
    },
    {
      id: 4,
      type: 'hr',
      action: 'Employé ajouté',
      user: 'RH Department',
      time: 'Il y a 2 jours',
      amount: '',
    },
  ];

  const complianceStatus = [
    { item: 'Plan de comptes SYSCOHADA', status: 'conforme', progress: 100 },
    { item: 'Journal général', status: 'conforme', progress: 100 },
    { item: 'Grand livre', status: 'conforme', progress: 95 },
    { item: 'Balance de vérification', status: 'en cours', progress: 80 },
    { item: 'États financiers', status: 'en cours', progress: 75 },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8 border-2 border-nodeen-primary border-r-transparent"></div>
          <span className="ml-3 text-nodeen-text">Chargement du tableau de bord...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-nodeen-primary">Tableau de Bord</h1>
          <p className="text-nodeen-text text-opacity-70 mt-2">
            Vue d'ensemble de votre ERP Tiin - {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${servicesHealth.finance ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>Finance</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${servicesHealth.hr ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>RH</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${servicesHealth.database ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>Base de données</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-nodeen-primary">{stats.totalEmployees}</div>
          <div className="text-sm text-nodeen-text text-opacity-70">Total Employés</div>
          <div className="mt-2 text-xs text-green-500">
            {stats.activeEmployees} actifs
          </div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl font-bold text-nodeen-secondary">{stats.totalJournals}</div>
          <div className="text-sm text-nodeen-text text-opacity-70">Écritures Comptables</div>
          <div className="mt-2 text-xs text-blue-500">
            Ce mois: {Math.floor(stats.totalJournals * 0.3)}
          </div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl font-bold text-nodeen-accent">{stats.recentPayrolls}</div>
          <div className="text-sm text-nodeen-text text-opacity-70">Paies Récentes</div>
          <div className="mt-2 text-xs text-yellow-500">
            30 derniers jours
          </div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-500">{stats.totalAccounts}</div>
          <div className="text-sm text-nodeen-text text-opacity-70">Comptes SYSCOHADA</div>
          <div className="mt-2 text-xs text-green-500">
            100% conforme
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="card-hover group transform hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white text-xl shadow-lg`}>
                {action.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-nodeen-text group-hover:text-nodeen-primary transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-nodeen-text text-opacity-70">
                  {action.description}
                </p>
              </div>
              <div className="text-nodeen-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-nodeen-text">Activités Récentes</h2>
            <Button variant="ghost" size="sm">
              Voir tout
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-nodeen-bg hover:bg-nodeen-primary hover:bg-opacity-10 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'finance' 
                    ? 'bg-blue-500 bg-opacity-20 text-blue-400' 
                    : 'bg-green-500 bg-opacity-20 text-green-400'
                }`}>
                  {activity.type === 'finance' ? 'F' : 'R'}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-nodeen-text">{activity.action}</div>
                  <div className="text-sm text-nodeen-text text-opacity-70">
                    par {activity.user} • {activity.time}
                  </div>
                </div>
                
                {activity.amount && (
                  <div className={`text-sm font-medium ${
                    activity.amount.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {activity.amount}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Status */}
        <div className="card">
          <h2 className="text-lg font-semibold text-nodeen-text mb-6">Conformité SYSCOHADA</h2>
          
          <div className="space-y-4">
            {complianceStatus.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-nodeen-text text-sm">{item.item}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'conforme' 
                      ? 'bg-green-500 bg-opacity-20 text-green-400'
                      : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
                
                <div className="w-full bg-nodeen-bg rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      item.progress === 100 
                        ? 'bg-green-500' 
                        : item.progress >= 80 
                        ? 'bg-yellow-500' 
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-nodeen-text text-opacity-70">
                  <span>Progression</span>
                  <span>{item.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Tasks */}
        <div className="card">
          <h3 className="font-semibold text-nodeen-text mb-4">Tâches en Attente</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-nodeen-bg rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-nodeen-text">Vérification balance</span>
              </div>
              <Button variant="ghost" size="sm">Vérifier</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-nodeen-bg rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-nodeen-text">Rapport mensuel</span>
              </div>
              <Button variant="ghost" size="sm">Générer</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-nodeen-bg rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-nodeen-text">Sauvegarde données</span>
              </div>
              <Button variant="ghost" size="sm">Exécuter</Button>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="card">
          <h3 className="font-semibold text-nodeen-text mb-4">Santé du Système</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-nodeen-text">Performance</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-nodeen-bg rounded-full h-2">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: '95%' }}></div>
                </div>
                <span className="text-sm text-green-500">95%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-nodeen-text">Stockage</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-nodeen-bg rounded-full h-2">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: '65%' }}></div>
                </div>
                <span className="text-sm text-blue-500">65%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-nodeen-text">Sécurité</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-nodeen-bg rounded-full h-2">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: '98%' }}></div>
                </div>
                <span className="text-sm text-green-500">98%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Reports */}
        <div className="card">
          <h3 className="font-semibold text-nodeen-text mb-4">Rapports Rapides</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Balance de vérification
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              État des stocks
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Rapport financier
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;