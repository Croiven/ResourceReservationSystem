import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import type { ReactNode } from 'react';

type ReservationCancelDialogProps = Readonly<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isCancelling: boolean;
  children: ReactNode;
}>;

export function ReservationCancelDialog({
  open,
  onClose,
  onConfirm,
  isCancelling,
  children,
}: ReservationCancelDialogProps) {
  const handleConfirm = () => {
    Promise.resolve(onConfirm()).catch(() => {
      // Caller surfaces errors via page state.
    });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Cancel reservation?</DialogTitle>
      <DialogContent>
        <DialogContentText>{children}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isCancelling}>
          Keep reservation
        </Button>
        <Button onClick={handleConfirm} color="error" disabled={isCancelling}>
          {isCancelling ? 'Cancelling…' : 'Cancel reservation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
