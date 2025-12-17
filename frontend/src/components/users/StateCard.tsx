import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatsCardProps {
  title: string;
  count: number;
  emoji: string;
  color: 'purple' | 'blue' | 'green';
}

const colorMap = {
  purple: {
    borderColor: '#6E11B0',
    bgColor: '#F3E8FF',
  },
  blue: {
    borderColor: '#193CB8',
    bgColor: '#DBEAFE',
  },
  green: {
    borderColor: '#016630',
    bgColor: '#DCFCE7',
  },
};

export default function StatsCard({ title, count, emoji, color }: StatsCardProps) {
  const stylesColor = colorMap[color];

  return (
    <View style={[styles.card, { borderColor: stylesColor.borderColor }]}>
      <View style={styles.inner}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.count}>{count}</Text>
        </View>
        <View style={[styles.emojiContainer, { backgroundColor: stylesColor.bgColor }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
  width: 292,
  height: 94,
  borderWidth: 0.8,
  borderRadius: 14,
  marginRight: 8,
  marginBottom: 8, 
  padding: 17,
  backgroundColor: '#fff',
  justifyContent: 'flex-start',
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 4, // spacing entre título y count
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333333',
  },
  count: {
    fontSize: 16,
    fontWeight: '400',
    color: '#101828',
  },
  emojiContainer: {
    width: 38,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
});
