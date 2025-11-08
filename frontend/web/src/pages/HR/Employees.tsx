import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { hrApi, handleApiError } from '../../services/api';

interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hireDate: string;
  birthDate: string;
  baseSalary: number;
  position: string;
  department: string;
  isActive: boolean;
  fullName: string;
  yearsOfService: number;
}

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    employeeNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    hireDate: '',
    birthDate: '',
    baseSalary: '',
    position: '',
    department: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await hrApi.getEmployees();
      setEmployees(response.data);
    } catch (error) {
      alert(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async () => {
    // Validate form
    const errors: Record<string, string> = {};
    if (!formData.employeeNumber) errors.employeeNumber = 'Le matricule est requis';
    if (!formData.firstName) errors.firstName = 'Le prénom est requis';
    if (!formData.lastName) errors.lastName = 'Le nom est requis';
    if (!formData.hireDate) errors.hireDate = "La date d'embauche est requise";
    if (!formData.baseSalary) errors.baseSalary = 'Le salaire de base est requis';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await hrApi.createEmployee({
        ...formData,
        baseSalary: parseFloat(formData.baseSalary),
        hireDate: formData.hireDate,
        birthDate: formData.birthDate || undefined
      });
      
      setShowCreateModal(false);
      resetForm();
      loadEmployees();
      alert('Employé créé avec succès');
    } catch (error) {
      alert(handleApiError(error));
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      // In a real app, you would call delete API
      // await hrApi.deleteEmployee(selectedEmployee.id);
      alert(`Employé ${selectedEmployee.fullName} supprimé (simulation)`);
      setShowDeleteModal(false);
      setSelectedEmployee(null);
      loadEmployees();
    } catch (error) {
      alert(handleApiError(error));
    }
  };

  const resetForm = () => {
    setFormData({
      employeeNumber: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      hireDate: '',
      birthDate: '',
      baseSalary: '',
      position: '',
      department: ''
    });
    setFormErrors({});
  };

  const columns = [
    {
      key: 'employeeNumber',
      header: 'Matricule',
      sortable: true
    },
    {
      key: 'fullName',
      header: 'Nom Complet',
      sortable: true,
      render: (value: string, row: Employee) => (
        <div>
          <div className="font-medium text-nodeen-text">{value}</div>
          <div className="text-sm text-nodeen-text text-opacity-70">{row.position}</div>
        </div>
      )
    },
    {
      key: 'department',
      header: 'Département',
      sortable: true
    },
    {
      key: 'baseSalary',
      header: 'Salaire Base',
      sortable: true,
      render: (value: number) => (
        <span className="salary-amount">
          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(value)}
        </span>
      )
    },
    {
      key: 'hireDate',
      header: "Date d'embauche",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('fr-FR')
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

  const departments = [
    { value: 'Direction', label: 'Direction' },
    { value: 'Finance', label: 'Finance' },
    { value: 'RH', label: 'Ressources Humaines' },
    { value: 'Commercial', label: 'Commercial' },
    { value: 'Technique', label: 'Technique' },
    { value: 'Production', label: 'Production' },
    { value: 'Logistique', label: 'Logistique' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-nodeen-primary">Gestion des Employés</h1>
          <p className="text-nodeen-text text-opacity-70 mt-2">
            Gérer les employés et leurs informations
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel Employé
        </Button>
      </div>

      {/* Employees Table */}
      <DataTable
        columns={columns}
        data={employees}
        keyField="id"
        loading={loading}
        searchable={true}
        searchPlaceholder="Rechercher un employé..."
        pagination={true}
        pageSize={10}
        actions={(employee: Employee) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEmployee(employee);
                // Navigate to edit or show details
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEmployee(employee);
                setShowDeleteModal(true);
              }}
            >
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </>
        )}
      />

      {/* Create Employee Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nouvel Employé"
        size="lg"
        actions={
          <>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateEmployee}>
              Créer l'employé
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Matricule *"
            value={formData.employeeNumber}
            onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
            error={formErrors.employeeNumber}
            required
          />
          <Input
            label="Département"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
          <Input
            label="Prénom *"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            error={formErrors.firstName}
            required
          />
          <Input
            label="Nom *"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            error={formErrors.lastName}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Téléphone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Date d'embauche *"
            type="date"
            value={formData.hireDate}
            onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
            error={formErrors.hireDate}
            required
          />
          <Input
            label="Date de naissance"
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
          />
          <Input
            label="Poste"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          />
          <Input
            label="Salaire de base (FCFA) *"
            type="number"
            step="0.01"
            value={formData.baseSalary}
            onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
            error={formErrors.baseSalary}
            required
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteEmployee}
        title="Supprimer l'employé"
        message={`Êtes-vous sûr de vouloir supprimer l'employé "${selectedEmployee?.fullName}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="danger"
      />
    </div>
  );
};

export default Employees;