import React from 'react';
import { PieChart } from 'react-native-gifted-charts';
import { View , Text , StyleSheet} from 'react-native';


export default function StatsPieChart({data }: {data: { label: string; value: number; color: string }[]}) {

  const ChartItem = ({ item }: { item: { label: string; value: number; color: string } }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
      <View style={{ width: 16, height: 16, backgroundColor: item.color, marginRight: 8, borderRadius: 8 }} />
      <Text>{item.label}: {item.value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <PieChart
        data={data}
        innerRadius={60}
        radius={100}
      />
      <View>
        {data.map((item, index) => (
          <ChartItem key={index} item={item} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
});