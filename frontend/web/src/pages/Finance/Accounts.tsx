import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { financeApi, handleApiError } from '../../services/api';

interface Account {
  code: string;
  name: string;
  nature: string;
  isActive: boolean;
  className: string;
  class: number;
}

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    filterAccounts();
  }, [accounts, searchTerm, selectedClass]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await financeApi.getAccounts();
      setAccounts(response.data);
    } catch (error) {
      alert(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    let filtered = accounts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(account =>
        account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by class
    if (selectedClass !== null) {
      filtered = filtered.filter(account => account.class === selectedClass);
    }

    setFilteredAccounts(filtered);
  };

  const classes = [
    { value: 1, label: 'Classe 1 - Comptes de capitaux' },
    { value: 2, label: 'Classe 2 - Comptes d\'immobilisations' },
    { value: 3, label: 'Classe 3 - Comptes de stocks' },
    { value: 4, label: 'Classe 4 - Comptes de tiers' },
    { value: 5, label: 'Classe 5 - Comptes financiers' },
    { value: 6, label: 'Classe 6 - Comptes de charges' },
    { value: 7, label: 'Classe 7 - Comptes de produits' },
    { value: 8, label: 'Classe 8 - Comptes spéciaux' },
    { value: 9, label: 'Classe 9 - Comptes d\'engagements' },
  ];

  const getNatureColor = (nature: string) => {
    switch (nature) {
      case 'ACTIF': return 'text-blue-400';
      case 'PASSIF': return 'text-green-400';
      case 'CHARGE': return 'text-red-400';
      case 'PRODUIT': return 'text-emerald-400';
      default: return 'text-nodeen-text';
    }
  };

  const getClassColor = (classNum: number) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
      'bg-pink-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'
    ];
    return colors[classNum - 1] || 'bg-gray-500';
  };

  const columns = [
    {
      key: 'code',
      header: 'Code',
      sortable: true,
      width: '120px',
      render: (value: string, row: Account) => (
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full ${getClassColor(row.class)} flex items-center justify-center text-white text-xs font-bold`}>
            {row.class}
          </div>
          <span className="font-mono font-bold text-nodeen-text">{value}</span>
        </div>
      )
    },
    {
      key: 'name',
      header: 'Désignation',
      sortable: true,
      render: (value: string, row: Account) => (
        <div>
          <div className="font-medium text-nodeen-text">{value}</div>
          <div className="text-sm text-nodeen-text text-opacity-70">{row.className}</div>
        </div>
      )
    },
    {
      key: 'nature',
      header: 'Nature',
      sortable: true,
      render: (value: string) => (
        <span className={`status-badge ${getNatureColor(value)} bg-opacity-20`}>
          {value}
        </span>
      )
    },
    {
      key: 'isActive',
      header: 'Statut',
      sortable: true,
      render: (value: boolean) => (
        <span className={value ? 'status-active' : 'status-inactive'}>
          {value ? 'Actif' : 'Inactif'}
        </span>
      )
    }
  ];

  const classSummary = classes.map(cls => ({
    ...cls,
    count: accounts.filter(acc => acc.class === cls.value).length,
    active: accounts.filter(acc => acc.class === cls.value && acc.isActive).length
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-nodeen-primary">Plan de Comptes SYSCOHADA</h1>
          <p className="text-nodeen-text text-opacity-70 mt-2">
            Gestion du plan comptable conforme aux normes SYSCOHADA
          </p>
        </div>
        <Button>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouveau Compte
        </Button>
      </div>

      {/* Class Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-4">
        {classSummary.map(cls => (
          <div
            key={cls.value}
            className={`card text-center cursor-pointer transform hover:scale-105 transition-all ${
              selectedClass === cls.value ? 'ring-2 ring-nodeen-primary' : ''
            }`}
            onClick={() => setSelectedClass(selectedClass === cls.value ? null : cls.value)}
          >
            <div className={`w-12 h-12 rounded-full ${getClassColor(cls.value)} flex items-center justify-center text-white font-bold text-lg mx-auto mb-2`}>
              {cls.value}
            </div>
            <div className="text-lg font-bold text-nodeen-text">{cls.count}</div>
            <div className="text-xs text-nodeen-text text-opacity-70">Comptes</div>
            <div className="text-xs text-green-500 mt-1">{cls.active} actifs</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher un compte par code ou libellé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
          <div className="flex space-x-2">
            <Button
              variant={selectedClass === null ? "primary" : "outline"}
              onClick={() => setSelectedClass(null)}
            >
              Toutes classes
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedClass(null);
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <DataTable
        columns={columns}
        data={filteredAccounts}
        keyField="code"
        loading={loading}
        searchable={false}
        pagination={true}
        pageSize={15}
        emptyMessage="Aucun compte trouvé avec les critères de recherche"
      />

      {/* SYSCOHADA Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-nodeen-text mb-4">Informations SYSCOHADA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-nodeen-text mb-2">Structure des classes</h4>
            <ul className="text-sm text-nodeen-text text-opacity-80 space-y-1">
              <li>• Classe 1-5 : Comptes de situation (Bilan)</li>
              <li>• Classe 6-7 : Comptes de gestion (Compte de résultat)</li>
              <li>• Classe 8-9 : Comptes spéciaux et engagements</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-nodeen-text mb-2">Natures comptables</h4>
            <ul className="text-sm text-nodeen-text text-opacity-80 space-y-1">
              <li><span className="text-blue-400">ACTIF</span> - Ressources de l'entreprise</li>
              <li><span className="text-green-400">PASSIF</span> - Sources de financement</li>
              <li><span className="text-red-400">CHARGE</span> - Coûts et dépenses</li>
              <li><span className="text-emerald-400">PRODUIT</span> - Revenus et gains</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accounts;