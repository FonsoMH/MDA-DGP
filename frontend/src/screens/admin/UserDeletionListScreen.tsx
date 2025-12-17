import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, FlatList } from 'react-native';

import BackButton from '../../components/common/BackButton/BackButton';
import { UserDeletionData } from '../../types/users';
import { useUserDeletions } from './hook/useUserDeletions';



const DeletionCard = ({ item }: { item: UserDeletionData }) => {
    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const eliminationDetails = `Eliminado por: ${item.adminName} el ${formatDate(item.deletedAt)}`;

    return (
        <View style={deletionCardStyles.card}>
            <View style={deletionCardStyles.userInfoContainer}>
                <Text style={deletionCardStyles.userNameText}>{item.deletedUserName}</Text>
                <Text style={deletionCardStyles.userEmailText}>{item.deletedUserEmail}</Text>
            </View>

            <View style={deletionCardStyles.adminDetailsContainer}>
                <Text style={deletionCardStyles.adminDetailsText}>
                    {eliminationDetails}
                </Text>
            </View>
        </View>
    );
};
// -----------------------------------------------------------


export default function UserDeletionListScreen() { 
  const { deletions, isLoading } = useUserDeletions();

  return (
    <View style={styles.container}>

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Historial de Eliminaciones</Text>
        <BackButton width={130} height={50}/>
      </View>

      <View style={styles.listHeader}>
        <Text style={[styles.listHeaderText, { flex: 2 }]}>Usuarios Eliminados</Text>
      </View>
      

      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : deletions.length === 0 ? (
        <Text style={styles.noDataText}>No hay registros de eliminaciones de usuarios.</Text>
      ) : (
        <FlatList
            data={deletions}
            keyExtractor={(item) => item.deletionId.toString()}
            renderItem={({ item }) => <DeletionCard item={item} />}
            contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F7F8FA', 
    padding: 30 
  },
  headerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  headerTitle: { 
    fontSize: 28,
    fontWeight: '800',
    color: '#1A202C'
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 0,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  listHeaderText: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'left',
    color: '#2D3748',
  },
  listContent: {
    paddingBottom: 20,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  }
});

const deletionCardStyles = StyleSheet.create({
    card: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        backgroundColor: '#FFFFFF', 
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    
    userInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 5,
    },
    userNameText: {
        flex: 1.5,
        fontSize: 16,
        fontWeight: '700',
        color: '#E53E3E',
    },
    userEmailText: {
        flex: 1.5,
        fontSize: 14,
        fontStyle: 'italic',
        color: '#718096',
        textAlign: 'right',
    },
    
    adminDetailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    adminDetailsText: {
        fontSize: 12,
        color: '#4A5568',
        fontWeight: '500',
    },
});