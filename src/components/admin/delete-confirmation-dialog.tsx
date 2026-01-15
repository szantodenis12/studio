
'use client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { BookingData } from "@/services/booking-service";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

interface DeleteConfirmationDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isDeleting: boolean;
    booking: BookingData | null;
}

export function DeleteConfirmationDialog({ 
    isOpen, 
    onOpenChange, 
    onConfirm,
    isDeleting,
    booking 
}: DeleteConfirmationDialogProps) {
    
    if (!booking) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Sunteți absolut sigur?</AlertDialogTitle>
                <AlertDialogDescription>
                    Această acțiune nu poate fi anulată. Se va șterge permanent rezervarea pentru {' '}
                    <span className="font-bold">{booking.fullName}</span> pentru camera de tip {' '}
                     <span className="font-bold">{booking.roomType}</span> din data de {' '}
                     <span className="font-bold">{format(new Date(booking.checkIn.seconds * 1000), 'PPP', { locale: ro })}</span>.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Anulare</AlertDialogCancel>
                <AlertDialogAction
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                    {isDeleting ? 'Se șterge...' : 'Da, șterge rezervarea'}
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

