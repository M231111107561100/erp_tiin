import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { hrApi, handleApiError } from '../../services/api';

interface PayrollRun {
  id: string;
  employeeId: string;
  period: string;
  baseSalary: number;
  grossSalary: number;
  ipresEmployee: number;
  ipresEmployer: number;
  css: number;
  ir: number;
  ipm: number;
  trimf: number;
  netSalary: number;
  createdAt: string;
  employee: {
    id: string;
    fullName: string;
    employeeNumber: string;
  };
}

interface Employee {
  id: string;
  employeeNumber: string;
  fullName: string;
  baseSalary: number;
}

const Payroll: React.FC = () => {
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [periods, setPeriods] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRunModal, setShowRunModal] = useState(false);
  const [runForm, setRunForm] = useState({
    period: '',
    employeeId: '',
    bonuses: '0'
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      loadPayrollRuns(selectedPeriod);
    }
  }, [selectedPeriod]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [employeesRes, periodsRes] = await Promise.all([
        hrApi.getEmployees(),
        hrApi.getPayrollPeriods()
      ]);
      
      setEmployees(employeesRes.data);
      setPeriods(periodsRes.data);
      
      // Set current period as default (YYYY-MM format)
      const now = new Date();
      const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setSelectedPeriod(currentPeriod);
    } catch (error) {
      alert(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const loadPayrollRuns = async (period: string) => {
    try {
      const response = await hrApi.getPayrollRuns(period);
      setPayrollRuns(response.data);
    } catch (error) {
      alert(handleApiError(error));
    }
  };

  const handleRunPayroll = async () => {
    if (!runForm.period || !runForm.employeeId) {
      alert('Veuillez sélectionner une période et un employé');
      return;
    }

    try {
      await hrApi.runPayroll({
        period: runForm.period,
        employeeId: runForm.employeeId,
        bonuses: parseFloat(runForm.bonuses) || 0
      });
      
      setShowRunModal(false);
      setRunForm({ period: '', employeeId: '', bonuses: '0' });
      loadPayrollRuns(runForm.period);
      alert('Paie calculée avec succès');
    } catch (error) {
      alert(handleApiError(error));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
  };

  const columns = [
    {
      key: 'employee.employeeNumber',
      header: 'Matricule',
      sortable: true
    },
    {
      key: 'employee.fullName',
      header: 'Employé',
      sortable: true
    },
    {
      key: 'grossSalary',
      header: 'Salaire Brut',
      sortable: true,
      render: (value: number) => (
        <span className="salary-amount">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'ipresEmployee',
      header: 'IPRES Salarial',
      sortable: true,
      render: (value: number) => (
        <span className="deduction-amount">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'ir',
      header: 'IR',
      sortable: true,
      render: (value: number) => (
        <span className="deduction-amount">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'netSalary',
      header: 'Salaire Net',
      sortable: true,
      render: (value: number) => (
        <span className="salary-amount font-bold">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'createdAt',
      header: 'Calculé le',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('fr-FR')
    }
  ];

  const currentYear = new Date().getFullYear();
  const periodOptions = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      value: `${currentYear}-${String(month).padStart(2, '0')}`,
      label: new Date(currentYear, i).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    };
  });

  const employeeOptions = employees.map(emp => ({
    value: emp.id,
    label: `${emp.employeeNumber} - ${emp.fullName}`
  }));

  const summary = payrollRuns.reduce(
    (acc, run) => ({
      totalGross: acc.totalGross + run.grossSalary,
      totalNet: acc.totalNet + run.netSalary,
      totalIpres: acc.totalIpres + run.ipresEmployee,
      totalIr: acc.totalIr + run.ir,
      count: acc.count + 1
    }),
    { totalGross: 0, totalNet: 0, totalIpres: 0, totalIr: 0, count: 0 }
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-nodeen-primary">Gestion de la Paie</h1>
          <p className="text-nodeen-text text-opacity-70 mt-2">
            Calcul et gestion des bulletins de paie Sénégal
          </p>
        </div>
        <Button
          onClick={() => setShowRunModal(true)}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Calculer une Paie
        </Button>
      </div>

      {/* Period Selector */}
      <div className="card">
        <div className="flex items-center gap-4">
          <label className="text-nodeen-text font-medium">Période:</label>
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            options={periodOptions}
          />
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="text-nodeen-text">
              {payrollRuns.length} employé(s) payé(s)
            </span>
            <span className="salary-amount">
              Total Net: {formatCurrency(summary.totalNet)}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-nodeen-primary">{summary.count}</div>
          <div className="text-sm text-nodeen-text text-opacity-70">Employés payés</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-500">{formatCurrency(summary.totalGross)}</div>
          <div className="text-sm text-nodeen-text text-opacity-70">Masse salariale brute</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-500">{formatCurrency(summary.totalIpres + summary.totalIr)}</div>
          <div className="text-sm text-nodeen-text text-opacity-70">Charges salariales</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-nodeen-accent">{formatCurrency(summary.totalNet)}</div>
          <div className="text-sm text-nodeen-text text-opacity-70">Net à payer</div>
        </div>
      </div>

      {/* Payroll Runs Table */}
      <DataTable
        columns={columns}
        data={payrollRuns}
        keyField="id"
        loading={loading}
        searchable={true}
        searchPlaceholder="Rechercher un bulletin..."
        pagination={true}
        pageSize={10}
      />

      {/* Run Payroll Modal */}
      <Modal
        isOpen={showRunModal}
        onClose={() => setShowRunModal(false)}
        title="Calculer une Paie"
        size="md"
        actions={
          <>
            <Button variant="outline" onClick={() => setShowRunModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleRunPayroll}>
              Calculer la paie
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Période *"
            value={runForm.period}
            onChange={(e) => setRunForm({ ...runForm, period: e.target.value })}
            options={periodOptions}
            required
          />
          
          <Select
            label="Employé *"
            value={runForm.employeeId}
            onChange={(e) => setRunForm({ ...runForm, employeeId: e.target.value })}
            options={employeeOptions}
            required
          />
          
          <Input
            label="Primes et Bonus (FCFA)"
            type="number"
            step="0.01"
            value={runForm.bonuses}
            onChange={(e) => setRunForm({ ...runForm, bonuses: e.target.value })}
            helper="Montant des primes et bonus à ajouter au salaire de base"
          />

          {runForm.employeeId && (
            <div className="p-4 bg-nodeen-bg rounded-xl">
              <h4 className="font-medium text-nodeen-text mb-2">Informations employé</h4>
              {(() => {
                const employee = employees.find(emp => emp.id === runForm.employeeId);
                return employee ? (
                  <div className="text-sm text-nodeen-text text-opacity-80">
                    <div>Salaire de base: {formatCurrency(employee.baseSalary)}</div>
                    <div>Calcul estimé IPRES: {formatCurrency(employee.baseSalary * 0.056)}</div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Payroll;