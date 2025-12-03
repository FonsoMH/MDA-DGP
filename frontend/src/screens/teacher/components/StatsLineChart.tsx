import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';


const reduceDataAmount = (data : any[], factor : number)=> {
  if(factor < data.length && factor <= 1) 
    return data.map((item, index) => ({
    value: item.value,
    date: item.date,
    label: (Math.floor(index / factor) % 2 === 0) ? "" : item.label
  }));

  return data.reduce((acc, item, index) => {
    
    if (index % factor === 0) {
      const newItem = {
        ...item,
        count: 1
      };
      
      acc.push(newItem);
    }
    else{
      const currentGroup = acc[acc.length - 1];
      currentGroup.value += item.value;
      currentGroup.count += 1;

      const startDate = currentGroup.date.split(' - ')[0];
      currentGroup.date = `${startDate} - ${item.date}`;
    }
    return acc;
  }, []).map(item => {
    const count = item.count || 1;
    const {count: _, ...finalItem} = item;
    return {
      ...finalItem,
      value: finalItem.value / count
    };
  }).map((item: { value: number; date: string; label: string}, index: number)  => ({
    value: item.value,
    date: item.date,
    label: (Math.floor(index / factor) % 2 === 0) ? "" : item.label
  }));
}

export default function StatsLineChart({ data }: { data: { value: number; date: string; label: string }[] }) {

    const maxDots = 20;

    const chartData = reduceDataAmount(data, Math.ceil(data.length / maxDots)); 
    
        return (
            <View style={styles.contenedorFijo}>
                <Text style={{ transform: [{ rotate: '-90deg' }], textAlign: 'center', fontSize: 12, color: '#555', fontWeight: 'bold' }}>
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
                width={Dimensions.get('window').width * 0.45}
                
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
                    pointerStripUptoDataPoint: true,
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
                <Text style={{textAlign: 'center', fontSize: 12, color: '#555', fontWeight: 'bold' }}>
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