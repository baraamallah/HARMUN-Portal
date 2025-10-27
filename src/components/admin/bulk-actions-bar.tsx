"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BulkActionsBarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete?: () => void;
  onExport?: () => void;
  customActions?: React.ReactNode;
  maxSelection?: number;
  isLoading?: boolean;
  className?: string;
}

/**
 * Fixed action bar that appears when items are selected
 * Provides bulk operations like delete, export, etc.
 */
export function BulkActionsBar({
  selectedCount,
  onClear,
  onDelete,
  onExport,
  customActions,
  maxSelection = 50,
  isLoading = false,
  className,
}: BulkActionsBarProps) {
  const isMaxed = selectedCount >= maxSelection;

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
            'bg-card border border-border rounded-lg shadow-lg',
            'px-6 py-4 flex items-center gap-4',
            'max-w-2xl w-full mx-4',
            className
          )}
        >
          {/* Selection info */}
          <div className="flex-1">
            <p className="text-sm font-medium">
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </p>
            {isMaxed && (
              <p className="text-xs text-muted-foreground">
                Maximum selection limit reached
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {customActions}

            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={isLoading}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            )}

            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
                disabled={isLoading}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              disabled={isLoading}
              title="Clear selection"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
