import React from 'react';
import { Search } from 'lucide-react';

type SaleType = 'all' | 'wholesale' | 'retail';

interface TransactionFiltersProps {
    searchQuery: string;
    typeFilter: SaleType;
    onSearchChange: (v: string) => void;
    onTypeChange: (v: SaleType) => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
                                                                   searchQuery,
                                                                   typeFilter,
                                                                   onSearchChange,
                                                                   onTypeChange,
                                                               }) => (
    <div className="flex gap-3 w-full md:w-auto">
        {/* Search */}
        <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search receipt, customer, employee…"
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors text-sm"
            />
        </div>

        {/* Type select */}
        <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value as SaleType)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors text-sm"
        >
            <option value="all">All Types</option>
            <option value="wholesale">Wholesale</option>
            <option value="retail">Retail</option>
        </select>
    </div>
);

export default TransactionFilters;