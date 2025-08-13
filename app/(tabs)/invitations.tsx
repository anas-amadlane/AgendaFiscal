import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Send, Inbox, Search, MoreHorizontal, Plus } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import InvitationCard from '@/components/InvitationCard';
import apiProxy from '@/utils/apiProxy';

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
  invitation_token?: string;
}

export default function InvitationsScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>([]);
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInvitations();
  }, [activeTab]);

  const loadInvitations = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (activeTab === 'received') {
        const response = await apiProxy.getReceivedInvitations({ limit: 50 });
        setReceivedInvitations(response.invitations || []);
      } else {
        const response = await apiProxy.getSentInvitations({ limit: 50 });
        setSentInvitations(response.invitations || []);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
      Alert.alert('Erreur', 'Impossible de charger les invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInvitations();
    setRefreshing(false);
  };

  const handleAcceptInvitation = async (invitation: Invitation) => {
    if (!invitation.invitation_token) {
      Alert.alert('Erreur', 'Token d\'invitation manquant');
      return;
    }

    Alert.alert(
      'Confirmer l\'acceptation',
      `Voulez-vous accepter l'invitation pour rejoindre "${invitation.company_name}" en tant que ${invitation.role === 'manager' ? 'manager' : 'agent'} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Accepter',
          onPress: async () => {
            try {
              setLoading(true);
              await apiProxy.acceptInvitation(invitation.invitation_token!);
              Alert.alert('Succès', `Vous avez rejoint l'entreprise "${invitation.company_name}"`);
              await loadInvitations();
            } catch (error) {
              console.error('Error accepting invitation:', error);
              Alert.alert('Erreur', 'Impossible d\'accepter l\'invitation');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDeclineInvitation = async (invitation: Invitation) => {
    if (!invitation.invitation_token) {
      Alert.alert('Erreur', 'Token d\'invitation manquant');
      return;
    }

    Alert.alert(
      'Confirmer le refus',
      `Voulez-vous refuser l'invitation pour "${invitation.company_name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await apiProxy.declineInvitation(invitation.invitation_token!);
              Alert.alert('Invitation refusée', 'L\'invitation a été refusée');
              await loadInvitations();
            } catch (error) {
              console.error('Error declining invitation:', error);
              Alert.alert('Erreur', 'Impossible de refuser l\'invitation');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCancelInvitation = async (invitation: Invitation) => {
    Alert.alert(
      'Annuler l\'invitation',
      `Voulez-vous annuler l'invitation envoyée à ${invitation.email} pour "${invitation.company_name}" ?`,
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Annuler l\'invitation',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await apiProxy.cancelInvitation(invitation.id);
              Alert.alert('Invitation annulée', 'L\'invitation a été annulée');
              await loadInvitations();
            } catch (error) {
              console.error('Error cancelling invitation:', error);
              Alert.alert('Erreur', 'Impossible d\'annuler l\'invitation');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const currentInvitations = activeTab === 'received' ? receivedInvitations : sentInvitations;
  const pendingCount = currentInvitations.filter(inv => inv.status === 'pending').length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <View style={[styles.logoBar, { backgroundColor: '#3B82F6' }]} />
                <View style={[styles.logoBar, { backgroundColor: '#10B981' }]} />
                <View style={[styles.logoBar, { backgroundColor: '#F59E0B' }]} />
              </View>
              <View>
                <Text style={styles.appName}>Agenda Fiscal</Text>
                <Text style={styles.appSubtitle}>Marocain</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Search size={20} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <MoreHorizontal size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>Invitations</Text>
          <Text style={styles.subtitle}>
            {pendingCount > 0 ? `${pendingCount} invitation${pendingCount > 1 ? 's' : ''} en attente` : 'Aucune invitation en attente'}
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Inbox size={20} color={activeTab === 'received' ? '#3B82F6' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
            Reçues
          </Text>
          {receivedInvitations.filter(inv => inv.status === 'pending').length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {receivedInvitations.filter(inv => inv.status === 'pending').length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <Send size={20} color={activeTab === 'sent' ? '#3B82F6' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
            Envoyées
          </Text>
          {sentInvitations.filter(inv => inv.status === 'pending').length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {sentInvitations.filter(inv => inv.status === 'pending').length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {loading && currentInvitations.length === 0 ? (
            <View style={styles.emptyState}>
              <Mail size={48} color="#94A3B8" />
              <Text style={styles.emptyStateText}>Chargement des invitations...</Text>
            </View>
          ) : currentInvitations.length === 0 ? (
            <View style={styles.emptyState}>
              <Mail size={48} color="#94A3B8" />
              <Text style={styles.emptyStateText}>
                {activeTab === 'received' 
                  ? 'Aucune invitation reçue' 
                  : 'Aucune invitation envoyée'
                }
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {activeTab === 'received'
                  ? 'Les invitations que vous recevez apparaîtront ici'
                  : 'Invitez des utilisateurs à rejoindre vos entreprises'
                }
              </Text>
            </View>
          ) : (
            currentInvitations.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                type={activeTab}
                onAccept={handleAcceptInvitation}
                onDecline={handleDeclineInvitation}
                onCancel={handleCancelInvitation}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  headerLeft: {
    flex: 1
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12
  },
  logoBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 2
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A'
  },
  appSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleSection: {
    marginBottom: 8
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500'
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8
  },
  activeTab: {
    backgroundColor: '#EFF6FF'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B'
  },
  activeTabText: {
    color: '#3B82F6'
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 16
  },
  content: {
    paddingBottom: 24
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 32
  }
});