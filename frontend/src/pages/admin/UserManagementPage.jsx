import { useState, useEffect, useCallback } from 'react';
import { userApi } from '../../api/userApi';
import { toast } from '../../utils/toast';
import UserFilters from '../../components/admin/UserFilters';
import UserTable from '../../components/admin/UserTable';
import ChangeRoleModal from '../../components/admin/ChangeRoleModal';
import CreateUserModal from '../../components/admin/CreateUserModal';
import ConfirmModal from '../../components/ConfirmModal';
import Pagination from '../../components/Pagination';

const INIT_FILTERS = { username: '', role: '', status: '' };
const PAGE_SIZE    = 20;

function UserManagementPage() {
  const [filters, setFilters]         = useState(INIT_FILTERS);
  const [page, setPage]               = useState(0);
  const [users, setUsers]             = useState([]);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);

  const [confirmToggle, setConfirmToggle] = useState(null);
  const [roleTarget, setRoleTarget]       = useState(null);
  const [showCreate, setShowCreate]       = useState(false);

  const buildSearch = useCallback(() => {
    const s = {};
    if (filters.username) s.username = filters.username;
    if (filters.role)     s.role     = filters.role;
    if (filters.status)   s.status   = filters.status;
    return s;
  }, [filters]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const search = buildSearch();
      const pagination = { page, size: PAGE_SIZE };
      const hasFilters = Object.keys(search).length > 0;

      const res  = hasFilters
        ? await userApi.searchUsers(search, pagination)
        : await userApi.getUsers(pagination);

      const body = res.data?.data ?? res.data ?? {};
      setUsers(body.content ?? []);
      setTotalPages(body.totalPages ?? 0);
      setTotalElements(body.totalElements ?? 0);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [buildSearch, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleFiltersChange = (f) => { setFilters(f); setPage(0); };

  const handleToggleStatus = async () => {
    if (!confirmToggle) return;
    try {
      if (confirmToggle.status === 'ACTIVE') {
        await userApi.deactivate(confirmToggle.userId);
        toast.success(`${confirmToggle.username} deactivated`);
      } else {
        await userApi.reactivate(confirmToggle.userId);
        toast.success(`${confirmToggle.username} activated`);
      }
      setConfirmToggle(null);
      load();
    } catch {
      // interceptor handles toast
    }
  };

  const handleChangeRole = async (newRole) => {
    if (!roleTarget) return;
    await userApi.changeRole(roleTarget.userId, newRole);
    toast.success(`${roleTarget.username} role changed to ${newRole}`);
    setRoleTarget(null);
    load();
  };

  const handleCreateUser = async (payload) => {
    await userApi.createUser(payload);
    toast.success(`User "${payload.username}" created`);
    setShowCreate(false);
    load();
  };

  const isActive = confirmToggle?.status === 'ACTIVE';

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="mb-1"><i className="bi bi-person-gear me-2"></i>User Management</h3>
          <p className="text-muted small mb-0">{totalElements} users total</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
          <i className="bi bi-person-plus me-1"></i>New User
        </button>
      </div>

      <UserFilters filters={filters} onChange={handleFiltersChange} />

      <div className="card">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <span className="fw-semibold small"><i className="bi bi-people me-2"></i>Users</span>
          <span className="text-muted small">{totalElements} total</span>
        </div>
        <div className="card-body p-0">
          <UserTable
            users={users}
            loading={loading}
            onToggleStatus={setConfirmToggle}
            onChangeRole={setRoleTarget}
          />
        </div>
        {totalPages > 1 && (
          <div className="card-footer bg-white">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <ConfirmModal
        show={!!confirmToggle}
        title={isActive ? 'Deactivate User' : 'Activate User'}
        message={`${isActive ? 'Deactivate' : 'Activate'} user "${confirmToggle?.username}"?`}
        confirmLabel={isActive ? 'Deactivate' : 'Activate'}
        confirmVariant={isActive ? 'warning' : 'success'}
        onConfirm={handleToggleStatus}
        onClose={() => setConfirmToggle(null)}
      />

      <ChangeRoleModal
        show={!!roleTarget}
        user={roleTarget}
        onClose={() => setRoleTarget(null)}
        onSaved={handleChangeRole}
      />

      <CreateUserModal
        show={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreateUser}
      />
    </div>
  );
}

export default UserManagementPage;
