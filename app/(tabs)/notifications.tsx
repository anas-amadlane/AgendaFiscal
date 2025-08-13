import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Bell, Search, Filter, MoveHorizontal as MoreHorizontal, Check, Trash2, Clock, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, Circle } from 'lucide-react-native';
import { generateMockNotifications } from '@/utils/mockData';
import { Notification } from '@/types/fiscal';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    const mockNotifications = generateMockNotifications();
    setNotifications(mockNotifications);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedNotifications);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedNotifications(newSelection);
    
    if (newSelection.size === 0) {
      setIsSelectionMode(false);
    }
  };

  const handleBulkAction = (action: 'read' | 'delete') => {
    if (action === 'read') {
      setNotifications(prev => prev.map(notif => 
        selectedNotifications.has(notif.id) ? { ...notif, isRead: true } : notif
      ));
    } else if (action === 'delete') {
      setNotifications(prev => prev.filter(notif => !selectedNotifications.has(notif.id)));
    }
    setSelectedNotifications(new Set());
    setIsSelectionMode(false);
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread':
        return !notif.isRead;
      case 'urgent':
        return notif.daysRemaining <= 3;
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(notif => !notif.isRead).length;
  const urgentCount = notifications.filter(notif => notif.daysRemaining <= 3).length;

  const getNotificationIcon = (daysRemaining: number) => {
    if (daysRemaining <= 1) {
      return <AlertTriangle size={16} color="#EF4444" />;
    } else if (daysRemaining <= 3) {
      return <Clock size={16} color="#F59E0B" />;
    } else {
      return <Bell size={16} color="#3B82F6" />;
    }
  };

  const getStatusColor = (daysRemaining: number) => {
    if (daysRemaining <= 1) {
      return '#EF4444';
    } else if (daysRemaining <= 3) {
      return '#F59E0B';
    } else {
      return '#10B981';
    }
  };

  const getStatusText = (daysRemaining: number) => {
    if (daysRemaining <= 1) {
      return 'Urgent';
    } else if (daysRemaining <= 3) {
      return 'Bientôt';
    } else {
      return 'Normal';
    }
  };

  const SwipeableNotification = ({ notification }: { notification: Notification }) => {
    const translateX = new Animated.Value(0);
    const opacity = new Animated.Value(1);

    const onGestureEvent = Animated.event(
      [{ nativeEvent: { translationX: translateX } }],
      { useNativeDriver: false }
    );

    const onHandlerStateChange = (event: any) => {
      if (event.nativeEvent.state === State.END) {
        const { translationX } = event.nativeEvent;
        
        if (translationX > 100) {
          markAsRead(notification.id);
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false
          }).start();
        } else if (translationX < -100) {
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: -400,
              duration: 300,
              useNativeDriver: false
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: false
            })
          ]).start(() => {
            removeNotification(notification.id);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false
          }).start();
        }
      }
    };

    const handlePress = () => {
      if (isSelectionMode) {
        toggleSelection(notification.id);
      } else {
        markAsRead(notification.id);
      }
    };

    const handleLongPress = () => {
      if (!isSelectionMode) {
        setIsSelectionMode(true);
        toggleSelection(notification.id);
      }
    };

    const isSelected = selectedNotifications.has(notification.id);
    const statusColor = getStatusColor(notification.daysRemaining);

    return (
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        enabled={!isSelectionMode}
      >
        <Animated.View style={[{ transform: [{ translateX }], opacity }]}>
          <TouchableOpacity
            style={[
              styles.notificationCard,
              !notification.isRead && styles.unreadCard,
              isSelected && styles.selectedCard
            ]}
            onPress={handlePress}
            onLongPress={handleLongPress}
            delayLongPress={500}
          >
            <View style={styles.cardHeader}>
              <View style={styles.leftSection}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <View style={styles.notificationContent}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.notificationTitle, !notification.isRead && styles.unreadTitle]}>
                      {notification.title}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                      <Text style={styles.statusText}>{getStatusText(notification.daysRemaining)}</Text>
                    </View>
                  </View>
                  <Text style={styles.notificationId}>N°{notification.id.slice(-6)}</Text>
                </View>
              </View>
              
              <View style={styles.rightSection}>
                {isSelectionMode ? (
                  <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
                    {isSelected && <Check size={14} color="#FFFFFF" />}
                  </View>
                ) : (
                  <TouchableOpacity style={styles.moreButton}>
                    <MoreHorizontal size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              
              <View style={styles.metaInfo}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Échéance</Text>
                  <Text style={styles.metaValue}>
                    {notification.dueDate.toLocaleDateString('fr-FR', { 
                      day: '2-digit', 
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Jours restants</Text>
                  <Text style={[styles.metaValue, { color: statusColor }]}>
                    {notification.daysRemaining}j
                  </Text>
                </View>
              </View>
            </View>

            {!notification.isRead && !isSelectionMode && (
              <View style={styles.unreadIndicator} />
            )}
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>N°{notifications.length.toString().padStart(8, '0')}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Search size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Filter size={20} color="#6B7280" />
              {(unreadCount > 0 || urgentCount > 0) && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{unreadCount + urgentCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Report Operations Section */}
        <View style={styles.reportSection}>
          <Text style={styles.reportTitle}>Rapport notifications</Text>
          <View style={styles.reportActions}>
            <TouchableOpacity style={styles.reportButton}>
              <Search size={16} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportButton}>
              <MoreHorizontal size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Selection Bar */}
      {isSelectionMode && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText}>
            {selectedNotifications.size} sélectionnée{selectedNotifications.size > 1 ? 's' : ''}
          </Text>
          <View style={styles.selectionActions}>
            <TouchableOpacity 
              style={styles.selectionAction}
              onPress={() => handleBulkAction('read')}
            >
              <CheckCircle2 size={18} color="#10B981" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.selectionAction}
              onPress={() => handleBulkAction('delete')}
            >
              <Trash2 size={18} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelSelection}
              onPress={() => {
                setSelectedNotifications(new Set());
                setIsSelectionMode(false);
              }}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'all' && styles.activeTab]}
          onPress={() => setFilter('all')}
        >
          <Circle size={8} color={filter === 'all' ? '#3B82F6' : '#D1D5DB'} fill={filter === 'all' ? '#3B82F6' : 'transparent'} />
          <Text style={[styles.filterTabText, filter === 'all' && styles.activeTabText]}>
            Toutes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterTab, filter === 'unread' && styles.activeTab]}
          onPress={() => setFilter('unread')}
        >
          <Circle size={8} color={filter === 'unread' ? '#10B981' : '#D1D5DB'} fill={filter === 'unread' ? '#10B981' : 'transparent'} />
          <Text style={[styles.filterTabText, filter === 'unread' && styles.activeTabText]}>
            Non lues
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterTab, filter === 'urgent' && styles.activeTab]}
          onPress={() => setFilter('urgent')}
        >
          <Circle size={8} color={filter === 'urgent' ? '#EF4444' : '#D1D5DB'} fill={filter === 'urgent' ? '#EF4444' : 'transparent'} />
          <Text style={[styles.filterTabText, filter === 'urgent' && styles.activeTabText]}>
            Urgentes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.notificationsContainer}>
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Bell size={32} color="#D1D5DB" />
              </View>
              <Text style={styles.emptyTitle}>Aucune notification</Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'unread' ? 'Toutes vos notifications sont lues' : 
                 filter === 'urgent' ? 'Aucune notification urgente' :
                 'Vous recevrez des notifications ici'}
              </Text>
            </View>
          ) : (
            filteredNotifications.map((notification) => (
              <SwipeableNotification key={notification.id} notification={notification} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Mark All Read Button */}
      {!isSelectionMode && unreadCount > 0 && (
        <View style={styles.floatingAction}>
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <CheckCircle2 size={16} color="#FFFFFF" />
            <Text style={styles.markAllText}>Tout marquer lu</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24
  },
  headerLeft: {
    flex: 1
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  reportSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A'
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8
  },
  reportButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderBottomWidth: 1,
    borderBottomColor: '#2563EB'
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  selectionAction: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cancelSelection: {
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#F8FAFC'
  },
  activeTab: {
    backgroundColor: '#F1F5F9'
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginLeft: 8
  },
  activeTabText: {
    color: '#0F172A',
    fontWeight: '600'
  },
  scrollView: {
    flex: 1
  },
  notificationsContainer: {
    padding: 20
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
    overflow: 'hidden'
  },
  unreadCard: {
    borderColor: '#3B82F6',
    borderWidth: 1.5
  },
  selectedCard: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12
  },
  notificationContent: {
    flex: 1
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    marginRight: 12
  },
  unreadTitle: {
    fontWeight: '700'
  },
  notificationId: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  rightSection: {
    alignItems: 'center'
  },
  moreButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkedBox: {
    backgroundColor: '#10B981',
    borderColor: '#10B981'
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  notificationMessage: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16
  },
  metaInfo: {
    gap: 8
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500'
  },
  metaValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600'
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20
  },
  floatingAction: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    left: 20
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  markAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8
  }
});