import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';


const reduceDataAmount = (data : any[], factor : number)=> {
  if(factor < data.length && factor <= 1) return data;



  let reduced = data.reduce((acc, item, index) => {
    
    if (index % factor === 0) {
      const newItem = {
        ...item,
        count: 1
      };
      
      if(Math.floor(index / factor) % 2 === 0){
        newItem.label = '';
      }
      acc.push(newItem);
    }
    else{
      const currentGroup = acc[acc.length - 1];
      currentGroup.value += item.value;
      currentGroup.count += 1;

      const startDate = currentGroup.date.split(' - ')[0];
      currentGroup.date = `${startDate} - ${item.date}`; ;
    }
    return acc;
  }, []);

  return reduced.map(item => {
    const count = item.count || 1;
    const {count: _, ...finalItem} = item;
    return {
      ...finalItem,
      value: finalItem.value / count
    };
  }
  );
}

export default function StatsLineChart({ data }: { data: { value: number; date: string; label: string }[] }) {

    const maxDots = 20;

    data = [
  { value: 0, label: '', date: '2015-01-01' },
  { value: 1, label: '', date: '2015-01-02' },
  { value: 2, label: '', date: '2015-01-03' },
  { value: 3, label: '', date: '2015-01-04' },
  { value: 4, label: '', date: '2015-01-05' },
  { value: 5, label: '', date: '2015-01-06' },
  { value: 6, label: '', date: '2015-01-07' },
  { value: 7, label: '', date: '2015-01-08' },
  { value: 8, label: '', date: '2015-01-09' },
  { value: 9, label: '', date: '2015-01-10' },
  { value: 10, label: '', date: '2015-01-11' },
  { value: 11, label: '', date: '2015-01-12' },
  { value: 12, label: '', date: '2015-01-13' },
  { value: 13, label: '', date: '2015-01-14' },
  { value: 14, label: '', date: '2015-01-15' },
  { value: 15, label: '', date: '2015-01-16' },
  { value: 16, label: '', date: '2015-01-17' },
  { value: 17, label: '', date: '2015-01-18' },
  { value: 18, label: '', date: '2015-01-19' },
  { value: 19, label: '', date: '2015-01-20' },
  { value: 20, label: '', date: '2015-01-21' },
  { value: 21, label: '', date: '2015-01-22' },
  { value: 22, label: '', date: '2015-01-23' },
  { value: 23, label: '', date: '2015-01-24' },
  { value: 24, label: '', date: '2015-01-25' },
  { value: 25, label: '', date: '2015-01-26' },
  { value: 26, label: '', date: '2015-01-27' },
  { value: 27, label: '', date: '2015-01-28' },
  { value: 28, label: '', date: '2015-01-29' },
  { value: 29, label: '', date: '2015-01-30' },
  { value: 30, label: '', date: '2015-01-31' },
  { value: 31, label: '', date: '2015-02-01' },
  { value: 32, label: '', date: '2015-02-02' },
  { value: 33, label: '', date: '2015-02-03' },
  { value: 34, label: '', date: '2015-02-04' },
  { value: 35, label: '', date: '2015-02-05' },
  { value: 36, label: '', date: '2015-02-06' },
  { value: 37, label: '', date: '2015-02-07' },
  { value: 38, label: '', date: '2015-02-08' },
  { value: 39, label: '', date: '2015-02-09' },
  { value: 40, label: '', date: '2015-02-10' },
  { value: 41, label: '', date: '2015-02-11' },
  { value: 42, label: '', date: '2015-02-12' },
  { value: 43, label: '', date: '2015-02-13' },
  { value: 44, label: '', date: '2015-02-14' },
  { value: 45, label: '', date: '2015-02-15' },
  { value: 46, label: '', date: '2015-02-16' },
  { value: 47, label: '', date: '2015-02-17' },
  { value: 48, label: '', date: '2015-02-18' },
  { value: 49, label: '', date: '2015-02-19' },
  { value: 50, label: '', date: '2015-02-20' },
  { value: 51, label: '', date: '2015-02-21' },
  { value: 52, label: '', date: '2015-02-22' },
  { value: 53, label: '', date: '2015-02-23' },
  { value: 54, label: '', date: '2015-02-24' },
  { value: 55, label: '', date: '2015-02-25' },
  { value: 56, label: '', date: '2015-02-26' },
  { value: 57, label: '', date: '2015-02-27' },
  { value: 58, label: '', date: '2015-02-28' },
  { value: 59, label: '', date: '2015-03-01' },
  { value: 60, label: '', date: '2015-03-02' },
  { value: 61, label: '', date: '2015-03-03' },
  { value: 62, label: '', date: '2015-03-04' },
  { value: 63, label: '', date: '2015-03-05' },
  { value: 64, label: '', date: '2015-03-06' },
  { value: 65, label: '', date: '2015-03-07' },
  { value: 66, label: '', date: '2015-03-08' },
  { value: 67, label: '', date: '2015-03-09' },
  { value: 68, label: '', date: '2015-03-10' },
  { value: 69, label: '', date: '2015-03-11' },
  { value: 70, label: '', date: '2015-03-12' },
  { value: 71, label: '', date: '2015-03-13' },
  { value: 72, label: '', date: '2015-03-14' },
  { value: 73, label: '', date: '2015-03-15' },
  { value: 74, label: '', date: '2015-03-16' },
  { value: 75, label: '', date: '2015-03-17' },
  { value: 76, label: '', date: '2015-03-18' },
  { value: 77, label: '', date: '2015-03-19' },
  { value: 78, label: '', date: '2015-03-20' },
  { value: 79, label: '', date: '2015-03-21' },
  { value: 80, label: '', date: '2015-03-22' },
  { value: 81, label: '', date: '2015-03-23' },
  { value: 82, label: '', date: '2015-03-24' },
  { value: 83, label: '', date: '2015-03-25' },
  { value: 84, label: '', date: '2015-03-26' },
  { value: 85, label: '', date: '2015-03-27' },
  { value: 86, label: '', date: '2015-03-28' },
  { value: 87, label: '', date: '2015-03-29' },
  { value: 88, label: '', date: '2015-03-30' },
  { value: 89, label: '', date: '2015-03-31' },
  { value: 90, label: '', date: '2015-04-01' },
  { value: 91, label: '', date: '2015-04-02' },
  { value: 92, label: '', date: '2015-04-03' },
  { value: 93, label: '', date: '2015-04-04' },
  { value: 94, label: '', date: '2015-04-05' },
  { value: 95, label: '', date: '2015-04-06' },
  { value: 96, label: '', date: '2015-04-07' },
  { value: 97, label: '', date: '2015-04-08' },
  { value: 98, label: '', date: '2015-04-09' },
  { value: 99, label: '', date: '2015-04-10' }
];

    const chartData = reduceDataAmount(data, Math.ceil(data.length / maxDots)); 
    
        return (
            <View style={styles.contenedorFijo}>
                <Text style={{ transform: [{ rotate: '-90deg' }], textAlign: 'center', fontSize: 10, color: '#555', fontWeight: 'bold' }}>
                  Tiempo (min)
                </Text>
              <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <LineChart

                areaChart
                color="#1E90FF"
                startFillColor="#87CEFA"
                endFillColor="white"
                data={chartData}
                spacing={500*1/maxDots}
                // width={Dimensions.get('window').width * 0.45}
                
                
                curved
                dataPointsRadius={5}
                dataPointsColor="#1E90FF"
                
                
                initialSpacing={0}
                xAxisLabelTextStyle={styles.etiquetaEjeX}
                xAxisColor="#D3D3D3"
                
                noOfSections={5}

                yAxisTextStyle={styles.etiquetaEjeY}
                yAxisColor="#D3D3D3"
                
                pointerConfig={{
                    pointerStripUptoDataPoint: false,
                    pointerStripColor: '#505050ff',
                    pointerStripWidth: 2,
                    strokeDashArray: [2, 5],
                    radius: 0,  
                    pointerLabelWidth: 100,
                    pointerLabelHeight: 150,
                    autoAdjustPointerLabelPosition: true,
                    pointerLabelComponent: items => {
                        return (
                            <View
                                style={{
                                    height: 90,
                                    width: 100,
                                    justifyContent: 'center',
                                }}>
                                <Text style={{ fontSize: 12, fontWeight: '700', textAlign: 'center' }}>
                                    {items[0].date}
                                </Text>
                                <Text style={{ fontSize: 12, textAlign: 'center' }}>
                                    Tiempo: {items[0].value} min
                                </Text>
                            </View>
                        )
                    }
                }}
                />
                <Text style={{textAlign: 'center', fontSize: 16, color: '#555', fontWeight: 'bold' }}>
                  Fecha
                </Text>
              </View>
            </View>
    );
};


const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  contenedorFijo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',    
    paddingVertical: 20,
    paddingRight: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    marginBottom: 10,

  },
  titulo: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 5,
  },
  etiquetaEjeX: {
    fontSize: 9,
    transform: [{ rotate: '-45deg' }],
    color: '#555',
  },
  etiquetaEjeY: {
    fontSize: 10,
    color: '#555',
  }
});