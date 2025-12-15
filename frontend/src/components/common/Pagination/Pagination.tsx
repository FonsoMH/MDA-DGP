import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface AdvancedPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageLimit?: number;
}

const DOTS = '...';

const AdvancedPagination: React.FC<AdvancedPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageLimit = 5,
}) => {
  const paginationRange = useMemo(() => {
    if (totalPages <= pageLimit) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfLimit = Math.floor(pageLimit / 2);
    const startPage = Math.max(1, currentPage - halfLimit);
    const endPage = Math.min(totalPages, currentPage + halfLimit);

    let range: (number | string)[] = [];

    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }

    const shouldShowLeftDots = startPage > 2;
    const shouldShowRightDots = endPage < totalPages - 1;

    if (shouldShowLeftDots && shouldShowRightDots) {
        range = [1, DOTS, ...range.slice(1, range.length - 1), DOTS, totalPages];
    } 
    else if (shouldShowLeftDots) {
        const newEnd = endPage - 2;
        range = [1, DOTS, ...Array.from({ length: pageLimit - 2 }, (_, i) => newEnd + i + 1)];
    } 
    else if (shouldShowRightDots) {
        const newStart = startPage + 2;
        range = [...Array.from({ length: pageLimit - 2 }, (_, i) => newStart - i - 1).reverse(), DOTS, totalPages];
    }
    
    if (!range.includes(1)) range.unshift(1);
    if (!range.includes(totalPages)) range.push(totalPages);

    return range;
  }, [currentPage, totalPages, pageLimit]);

  const renderItem = (item: number | string, index: number) => {
    if (item === DOTS) {
      return (
        <Text key={index} style={styles.dots}>
          {DOTS}
        </Text>
      );
    }

    const page = item as number;
    const isActive = page === currentPage;
    const style = isActive ? styles.activePage : styles.page;
    const textStyle = isActive ? styles.activeText : styles.text;

    return (
      <TouchableOpacity
        key={index}
        style={style}
        onPress={() => onPageChange(page)}
        disabled={isActive}
      >
        <Text style={textStyle}>{page}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.controlButton}
        onPress={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <Text style={currentPage === 1 ? styles.disabledText : styles.text}>{'<'}</Text>
      </TouchableOpacity>

      {paginationRange.map(renderItem)}

      <TouchableOpacity
        style={styles.controlButton}
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <Text style={currentPage === totalPages ? styles.disabledText : styles.text}>{'>'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  controlButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  page: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activePage: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: '#007aff',
  },
  text: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  activeText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledText: {
    fontSize: 16,
    color: '#ccc',
  },
  dots: {
    fontSize: 18,
    color: '#666',
    marginHorizontal: 4,
  },
});

export default AdvancedPagination;