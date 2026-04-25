import React from 'react';
import { format, parseISO } from 'date-fns';
import { Printer } from 'lucide-react';
import { Transaction } from '@/types';
import Modal from '../../../../components/common/Modal.tsx';
import Button from '../../../../components/common/Button.tsx';
import { printReceipt } from '@/pages/sales/ReceiptPrinter.ts';

interface TransactionDetailModalProps {
    transaction: Transaction | null;
    onClose: () => void;
}

const DetailRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <div className="text-white text-sm">{children}</div>
    </div>
);

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
                                                                           transaction,
                                                                           onClose,
                                                                       }) => (
    <Modal
        open={!!transaction}
        onClose={onClose}
        title="Transaction Details"
        maxWidth="md"
    >
        {transaction && (
            <div className="space-y-5">
                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-4">
                    <DetailRow label="Receipt #">
                        <span className="font-mono text-xs">{transaction.receiptNumber}</span>
                    </DetailRow>
                    <DetailRow label="Date">
                        {format(parseISO(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                    </DetailRow>
                    <DetailRow label="Customer">
                        {transaction.customerName}
                    </DetailRow>
                    <DetailRow label="Type">
            <span className={`capitalize font-semibold ${
                transaction.type === 'wholesale' ? 'text-blue-400' : 'text-green-400'
            }`}>
              {transaction.type}
            </span>
                    </DetailRow>
                    <DetailRow label="Employee">
                        {transaction.employeeName}
                    </DetailRow>
                    <DetailRow label="Items">
                        {transaction.items.length} item{transaction.items.length !== 1 ? 's' : ''}
                    </DetailRow>
                </div>

                {/* Items list */}
                <div className="border-t border-gray-700 pt-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Items</p>
                    <div className="space-y-2">
                        {transaction.items.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex justify-between items-center bg-gray-700/50 px-3 py-2.5 rounded-lg"
                            >
                                <div>
                                    <p className="text-white text-sm font-medium">{item.productName}</p>
                                    <p className="text-gray-400 text-xs">
                                        {item.quantity} × GH₵{item.unitPrice.toFixed(2)}
                                    </p>
                                </div>
                                <p className="text-orange-400 font-semibold text-sm">
                                    GH₵{item.totalAmount.toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center border-t border-gray-700 pt-4">
                    <p className="text-lg font-bold text-white">Total</p>
                    <p className="text-2xl font-black text-orange-400">
                        GH₵{transaction.totalAmount.toFixed(2)}
                    </p>
                </div>

                {/* Signatures (if present) */}
                {(transaction.employeeSignature || transaction.customerSignature) && (
                    <div className="grid grid-cols-2 gap-4 border-t border-gray-700 pt-4">
                        {transaction.employeeSignature && (
                            <DetailRow label="Employee Signature">
                                <span className="italic text-gray-300">{transaction.employeeSignature}</span>
                            </DetailRow>
                        )}
                        {transaction.customerSignature && (
                            <DetailRow label="Customer Signature">
                                <span className="italic text-gray-300">{transaction.customerSignature}</span>
                            </DetailRow>
                        )}
                    </div>
                )}

                <Button
                    variant="primary"
                    color="orange"
                    size="lg"
                    fullWidth
                    icon={<Printer className="w-5 h-5" />}
                    onClick={() => printReceipt(transaction)}
                >
                    Print Receipt
                </Button>
            </div>
        )}
    </Modal>
);

export default TransactionDetailModal;