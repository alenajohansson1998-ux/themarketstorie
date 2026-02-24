'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = [];
  const maxVisiblePages = 5;
  const halfVisible = Math.floor(maxVisiblePages / 2);

  let startPage = Math.max(1, currentPage - halfVisible);
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center gap-2 mt-6 justify-center">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300"
      >
        First
      </button>

      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300"
      >
        Previous
      </button>

      {startPage > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="px-3 py-2">
            1
          </button>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 rounded ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          <button onClick={() => onPageChange(totalPages)} className="px-3 py-2">
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300"
      >
        Next
      </button>

      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300"
      >
        Last
      </button>
    </div>
  );
}

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: string;
  onSort: (sort: string) => void;
}

export function SortableHeader({ label, sortKey, currentSort, onSort }: SortableHeaderProps) {
  const isActive = currentSort.includes(sortKey);
  const isAscending = !currentSort.startsWith('-');

  return (
    <button
      onClick={() => {
        if (isActive) {
          onSort(isAscending ? `-${sortKey}` : sortKey);
        } else {
          onSort(`-${sortKey}`);
        }
      }}
      className="flex items-center gap-1 hover:text-blue-600 font-semibold"
    >
      {label}
      {isActive && (isAscending ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
    </button>
  );
}

interface StatusBadgeProps {
  status: 'draft' | 'pending_payment' | 'payment_failed' | 'pending_review' | 'approved' | 'rejected' | 'published';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let color = 'bg-gray-100 text-gray-800';
  let label = status.charAt(0).toUpperCase() + status.slice(1);
  switch (status) {
    case 'published':
      color = 'bg-green-100 text-green-800'; label = '✅ Published'; break;
    case 'pending_review':
      color = 'bg-yellow-100 text-yellow-800'; label = '🟡 Pending Review'; break;
    case 'pending_payment':
      color = 'bg-blue-100 text-blue-800'; label = '🟦 Payment Pending'; break;
    case 'payment_failed':
      color = 'bg-red-100 text-red-800'; label = '🔴 Payment Failed'; break;
    case 'approved':
      color = 'bg-green-200 text-green-900'; label = '🟢 Approved'; break;
    case 'rejected':
      color = 'bg-red-200 text-red-900'; label = '⛔ Rejected'; break;
    case 'draft':
    default:
      color = 'bg-gray-100 text-gray-800'; label = 'Draft';
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>{label}</span>
  );
}

interface ConfirmDialogProps {
  title: string;
  message: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  isOpen,
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
