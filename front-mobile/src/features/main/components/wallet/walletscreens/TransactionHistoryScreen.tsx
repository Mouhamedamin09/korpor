import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter, useLocalSearchParams } from "expo-router";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";
import {
  fetchTransactionHistory,
  fetchWalletBalance,
  getCurrencySymbol,
  convertCurrency,
  type Transaction,
  type TransactionHistoryResponse,
  type WalletBalance
} from "../../../services/wallet";
import { fetchUserSettings, type UserSettings } from "../../../services/settings";

const TRANSACTION_TYPES = [
  { key: 'all', label: 'All Transactions', icon: 'list' },
  { key: 'withdrawal', label: 'Withdrawals', icon: 'arrow-up-circle' },
  { key: 'deposit', label: 'Deposits', icon: 'arrow-down-circle' },
  { key: 'reward', label: 'Rewards', icon: 'gift' },
  { key: 'investment', label: 'Investments', icon: 'trending-up' },
  { key: 'referral_bonus', label: 'Referrals', icon: 'users' },
];

const TRANSACTION_STATUS = [
  { key: 'all', label: 'All Statuses' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const TransactionHistoryScreen: React.FC = () => {
  const router = useRouter();
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string>("");
  const [walletData, setWalletData] = useState<WalletBalance | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  
  // Filters
  const [selectedType, setSelectedType] = useState<string>(filter === 'withdrawals' ? 'withdrawal' : 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, [selectedType, selectedStatus]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Load user settings and wallet data
      const [settings, wallet] = await Promise.all([
        fetchUserSettings("mouhamedaminkraiem09@gmail.com"),
        fetchWalletBalance()
      ]);
      
      setUserSettings(settings);
      setWalletData(wallet);
      
      // Load transactions
      await loadTransactions(1, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setCurrentPage(1);
        setTransactions([]);
      }

      const typeFilter = selectedType === 'all' ? undefined : selectedType;
      const statusFilter = selectedStatus === 'all' ? undefined : selectedStatus;
      
      const response: TransactionHistoryResponse = await fetchTransactionHistory(
        page,
        20,
        typeFilter,
        statusFilter
      );

      if (reset) {
        setTransactions(response.transactions);
      } else {
        setTransactions(prev => [...prev, ...response.transactions]);
      }

      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
      setHasMore(page < response.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
      console.error('Error loading transactions:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) return;
    
    setLoadingMore(true);
    await loadTransactions(currentPage + 1, false);
    setLoadingMore(false);
  };

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'failed' || status === 'cancelled') {
      return { name: 'x-circle', color: '#EF4444' };
    }
    if (status === 'pending') {
      return { name: 'clock', color: '#F59E0B' };
    }

    switch (type) {
      case 'deposit':
        return { name: 'arrow-down-circle', color: '#10B981' };
      case 'withdrawal':
        return { name: 'arrow-up-circle', color: '#EF4444' };
      case 'reward':
      case 'referral_bonus':
        return { name: 'gift', color: '#8B5CF6' };
      case 'investment':
        return { name: 'trending-up', color: '#3B82F6' };
      case 'rent_payout':
        return { name: 'home', color: '#10B981' };
      default:
        return { name: 'circle', color: '#6B7280' };
    }
  };

  const formatTransactionAmount = (transaction: Transaction) => {
    if (!userSettings || !walletData) return `${getCurrencySymbol(transaction.currency)} ${transaction.amount.toFixed(2)}`;
    
    const convertedAmount = convertCurrency(transaction.amount, transaction.currency, userSettings.currency);
    const symbol = getCurrencySymbol(userSettings.currency);
    
    const sign = ['withdrawal', 'investment'].includes(transaction.type) ? '-' : '+';
    return `${sign}${symbol} ${convertedAmount.toFixed(2)}`;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <TopBar title="Transaction History" onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="mt-4 text-gray-600">Loading transactions...</Text>
        </View>
      </View>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <TopBar title="Transaction History" onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center px-6">
          <Feather name="alert-circle" size={48} color="#EF4444" />
          <Text className="mt-4 text-lg font-medium text-gray-900 text-center">
            Unable to Load Transactions
          </Text>
          <Text className="mt-2 text-gray-600 text-center">{error}</Text>
          <TouchableOpacity
            onPress={loadInitialData}
            className="mt-6 bg-green-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* ── Top Bar ───────────────────────────────────────────── */}
      <TopBar 
        title={filter === 'withdrawals' ? 'Withdrawal History' : 'Transaction History'} 
        onBackPress={() => router.back()} 
      />

      {/* ── Filter Bar ─────────────────────────────────────────── */}
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-semibold text-gray-900">
            {transactions.length} Transaction{transactions.length !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className="flex-row items-center"
          >
            <Feather name="filter" size={20} color="#374151" />
            <Text className="ml-2 text-sm font-medium text-gray-700">Filter</Text>
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View className="space-y-3">
            {/* Type Filter */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {TRANSACTION_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    onPress={() => setSelectedType(type.key)}
                    className={`mr-2 px-3 py-2 rounded-full border ${
                      selectedType === type.key
                        ? 'bg-green-100 border-green-500'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Text className={`text-sm ${
                      selectedType === type.key ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Status Filter */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Status</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {TRANSACTION_STATUS.map((status) => (
                  <TouchableOpacity
                    key={status.key}
                    onPress={() => setSelectedStatus(status.key)}
                    className={`mr-2 px-3 py-2 rounded-full border ${
                      selectedStatus === status.key
                        ? 'bg-green-100 border-green-500'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Text className={`text-sm ${
                      selectedStatus === status.key ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </View>

      {/* ── Transaction List ───────────────────────────────────── */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          if (isCloseToBottom && hasMore && !loadingMore) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {transactions.length === 0 ? (
          <View className="flex-1 justify-center items-center py-12">
            <Feather name="inbox" size={48} color="#9CA3AF" />
            <Text className="mt-4 text-lg font-medium text-gray-900">No Transactions Found</Text>
            <Text className="mt-2 text-gray-600 text-center">
              {selectedType !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Your transactions will appear here once you start using your wallet.'}
            </Text>
          </View>
        ) : (
          <View className="px-4 py-2">
            {transactions.map((transaction, index) => {
              const icon = getTransactionIcon(transaction.type, transaction.status);
              
              return (
                <Card key={transaction.id} extraStyle="mb-3 p-4 bg-white rounded-2xl shadow-sm">
                  <View className="flex-row items-center">
                    <View className={`w-12 h-12 rounded-full items-center justify-center mr-4`} 
                          style={{ backgroundColor: `${icon.color}20` }}>
                      <Feather name={icon.name} size={24} color={icon.color} />
                    </View>

                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-base font-medium text-gray-900 capitalize">
                          {transaction.type.replace('_', ' ')}
                        </Text>
                        <Text className={`text-base font-semibold ${
                          ['withdrawal', 'investment'].includes(transaction.type) 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {formatTransactionAmount(transaction)}
                        </Text>
                      </View>

                                            {/* Description & Status */}
                        <View className="flex-row items-center justify-between">
                            <Text className="text-sm text-gray-600 flex-shrink" numberOfLines={1}>
                            {transaction.description || 'No description'}
                            </Text>
                            <View className={`px-3 py-1 rounded-full ${getStatusBadgeColor(transaction.status)}`}>
                            <Text className="text-xs font-medium capitalize">
                                {transaction.status}
                            </Text>
                            </View>
                        </View>


                      <Text className="text-xs text-gray-500 mt-1">
                        {formatDate(transaction.createdAt)}
                      </Text>

                      {transaction.reference && (
                        <Text className="text-xs text-gray-400 mt-1">
                          Ref: {transaction.reference}
                        </Text>
                      )}
                    </View>
                  </View>
                </Card>
              );
            })}

            {/* Load More Indicator */}
            {loadingMore && (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#10B981" />
                <Text className="mt-2 text-sm text-gray-600">Loading more...</Text>
              </View>
            )}

            {!hasMore && transactions.length > 0 && (
              <View className="py-4 items-center">
                <Text className="text-sm text-gray-500">No more transactions to load</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default TransactionHistoryScreen; 