import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema } from '../../schemas/authSchemas';
import FormInput from '../form/FormInput';
import FormSelect from '../form/FormSelect';

const ROLE_OPTIONS = [
  { value: 'ADMIN',        label: 'Admin' },
  { value: 'MERCHANT_OPS', label: 'Merchant Ops' },
  { value: 'POS_OPS',      label: 'POS Ops' },
  { value: 'RISK',         label: 'Risk' },
  { value: 'DISPUTES',     label: 'Disputes' },
  { value: 'RECON',        label: 'Recon' },
];

export default function CreateUserModal({ show, onClose, onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: { username: '', password: '', email: '', name: '', phone: '', role: 'MERCHANT_OPS' },
  });

  const onSubmit = async (data) => {
    const payload = {
      username: data.username,
      password: data.password,
      role: data.role,
      ...(data.email && { email: data.email }),
      ...(data.name  && { name:  data.name }),
      ...(data.phone && { phone: data.phone }),
    };
    await onCreated(payload);
    reset();
  };

  const handleClose = () => { reset(); onClose(); };

  if (!show) return null;

  return (
    <>
      <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title">
                <i className="bi bi-person-plus me-2"></i>Create User
              </h6>
              <button type="button" className="btn-close" onClick={handleClose} disabled={isSubmitting} />
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <FormInput
                  id="cu-username"
                  label="Username"
                  required
                  autoComplete="off"
                  error={errors.username?.message}
                  disabled={isSubmitting}
                  {...register('username')}
                />
                <FormInput
                  id="cu-password"
                  label="Password"
                  type="password"
                  required
                  autoComplete="new-password"
                  error={errors.password?.message}
                  disabled={isSubmitting}
                  {...register('password')}
                />
                <FormInput
                  id="cu-email"
                  label="Email"
                  type="email"
                  error={errors.email?.message}
                  disabled={isSubmitting}
                  {...register('email')}
                />
                <FormInput
                  id="cu-name"
                  label="Name"
                  error={errors.name?.message}
                  disabled={isSubmitting}
                  {...register('name')}
                />
                <FormInput
                  id="cu-phone"
                  label="Phone"
                  error={errors.phone?.message}
                  disabled={isSubmitting}
                  {...register('phone')}
                />
                <FormSelect
                  id="cu-role"
                  label="Role"
                  required
                  options={ROLE_OPTIONS}
                  error={errors.role?.message}
                  disabled={isSubmitting}
                  {...register('role')}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleClose} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><span className="spinner-border spinner-border-sm me-1" role="status"></span>Creating…</>
                  ) : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} />
    </>
  );
}
