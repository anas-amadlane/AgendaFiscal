import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mail, Clock, CheckCircle, XCircle, Users, Building2 } from 'lucide-react-native';

interface Invitation {
  id: string;
  email: string;
  role: 'manager' | 'agent';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  company_name: string;
  inviter_name?: string;
  created_at: string;
  expires_at: string;
  message?: string;
}

interface InvitationCardProps {
  invitation: Invitation;
  type: 'sent' | 'received';
  onAccept?: (invitation: Invitation) => void;
  onDecline?: (invitation: Invitation) => void;
  onCancel?: (invitation: Invitation) => void;
}

export default function InvitationCard({ 
  invitation, 
  type, 
  onAccept, 
  onDecline, 
  onCancel 
}: InvitationCardProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'accepted': return '#10B981';
      case 'declined': return '#EF4444';
      case 'expired': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} color={getStatusColor(status)} />;
      case 'accepted': return <CheckCircle size={16} color={getStatusColor(status)} />;
      case 'declined': return <XCircle size={16} color={getStatusColor(status)} />;
      case 'expired': return <XCircle size={16} color={getStatusColor(status)} />;
      default: return <Clock size={16} color={getStatusColor(status)} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Acceptée';
      case 'declined': return 'Refusée';
      case 'expired': return 'Expirée';
      default: return status;
    }
  };

  const getRoleText = (role: string) => {
    return role === 'manager' ? 'Manager' : 'Agent';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isExpired = new Date() > new Date(invitation.expires_at);
  const canTakeAction = invitation.status === 'pending' && !isExpired;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <Building2 size={20} color="#3B82F6" />
          <Text style={styles.companyName}>{invitation.company_name}</Text>
        </View>
        <View style={styles.statusContainer}>
          {getStatusIcon(invitation.status)}
          <Text style={[styles.statusText, { color: getStatusColor(invitation.status) }]}>
            {getStatusText(invitation.status)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.roleContainer}>
          <Users size={16} color="#64748B" />
          <Text style={styles.roleText}>Rôle: {getRoleText(invitation.role)}</Text>
        </View>

        <View style={styles.emailContainer}>
          <Mail size={16} color="#64748B" />
          <Text style={styles.emailText}>
            {type === 'sent' ? `Invité: ${invitation.email}` : `De: ${invitation.inviter_name || 'Manager'}`}
          </Text>
        </View>

        {invitation.message && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>"{invitation.message}"</Text>
          </View>
        )}

        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            Envoyée le {formatDate(invitation.created_at)}
          </Text>
          <Text style={styles.expiryText}>
            Expire le {formatDate(invitation.expires_at)}
          </Text>
        </View>
      </View>

      {canTakeAction && (
        <View style={styles.actions}>
          {type === 'received' ? (
            <>
              <TouchableOpacity 
                style={styles.declineButton} 
                onPress={() => onDecline?.(invitation)}
              >
                <Text style={styles.declineButtonText}>Refuser</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.acceptButton} 
                onPress={() => onAccept?.(invitation)}
              >
                <Text style={styles.acceptButtonText}>Accepter</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => onCancel?.(invitation)}
            >
              <Text style={styles.cancelButtonText}>Annuler l'invitation</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 8
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4
  },
  content: {
    padding: 16
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  roleText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  emailText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
    flex: 1
  },
  messageContainer: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
    marginBottom: 12
  },
  messageText: {
    fontSize: 14,
    color: '#475569',
    fontStyle: 'italic'
  },
  dateContainer: {
    gap: 4
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8'
  },
  expiryText: {
    fontSize: 12,
    color: '#94A3B8'
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  declineButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600'
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  cancelButtonText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '600'
  }
});