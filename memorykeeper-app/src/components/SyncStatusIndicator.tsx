import { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import React from 'react';
import { useDataSync } from '../hooks/useDataSync';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle, CloudOff, Clock } from 'lucide-react';

const SyncStatusIndicator: React.FC = () => {
  const { isOnline, syncStatus, lastSyncTime, pendingChanges, forceSync, queueSync } = useDataSync();

  const formatLastSyncTime = (timestamp: number | null): string => {
    if (!timestamp) return 'Never';
    
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="w-4 h-4 text-gray-500" />;
    }
    
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'idle':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (!isOnline) {
      return 'Offline';
    }
    
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'error':
        return 'Sync error';
      case 'idle':
        return 'Synced';
      default:
        return 'Online';
    }
  };

  const getStatusColor = () => {
    if (!isOnline) {
      return 'text-gray-500';
    }
    
    switch (syncStatus) {
      case 'syncing':
        return 'text-blue-500';
      case 'error':
        return 'text-red-500';
      case 'idle':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <div
        className="flex items-center gap-1"
        aria-live="polite"
        role="status"
      >
        {getStatusIcon()}
        <span className={getStatusColor()}>{getStatusText()}</span>
      </div>
      
      {lastSyncTime && (
        <span className="text-gray-500">
          {formatLastSyncTime(lastSyncTime)}
        </span>
      )}
      
      {pendingChanges > 0 && (
        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
          {pendingChanges} pending
        </span>
      )}
      
      {!isOnline && (
        <button
          onClick={queueSync}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          title="Queue for sync when online"
        >
          <Clock className="w-3 h-3" />
          Queue
        </button>
      )}
      
      {isOnline && (
        <button
          onClick={forceSync}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          title="Sync now"
        >
          <RefreshCw className="w-3 h-3" />
          Sync
        </button>
      )}
    </div>
  );
};

export default SyncStatusIndicator;
