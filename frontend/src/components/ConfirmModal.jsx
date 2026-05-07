import { useEffect, useRef } from 'react';
import { Modal } from 'bootstrap';

function ConfirmModal({
  show,
  onClose,
  onConfirm,
  title = 'Confirm action',
  message = 'Are you sure?',
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  loading = false,
}) {
  const modalRef = useRef(null);
  const bsModalRef = useRef(null);

  useEffect(() => {
    if (modalRef.current) {
      bsModalRef.current = new Modal(modalRef.current, {
        backdrop: 'static',
        keyboard: true,
      });

      const node = modalRef.current;
      const handleHidden = () => {
        if (show) onClose();
      };
      node.addEventListener('hidden.bs.modal', handleHidden);

      return () => {
        node.removeEventListener('hidden.bs.modal', handleHidden);
        bsModalRef.current?.hide();
        bsModalRef.current?.dispose();
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');
      };
    }
  }, []);

  useEffect(() => {
    if (!bsModalRef.current) return;
    if (show) {
      bsModalRef.current.show();
    } else {
      bsModalRef.current.hide();
    }
  }, [show]);

  return (
    <div className="modal fade" ref={modalRef} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-exclamation-triangle text-warning me-2"></i>
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            {typeof message === 'string' ? <p className="mb-0">{message}</p> : message}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`btn btn-${confirmVariant}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Working...
                </>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
