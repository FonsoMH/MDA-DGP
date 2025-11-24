import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

// --- 1. FUNCIÓN PARA GENERAR DATOS DE PRUEBA (SIMULACIÓN DE 100 DÍAS) ---
const generarDatosSimulados = (diasTotales) => {
  const datos = [];
  let tiempoBase = 0; // Empezamos en 25 minutos

  for (let i = 0; i <= diasTotales; i++) {
    // Simula una tendencia decreciente con ruido
    tiempoBase = Math.max(5, tiempoBase - 0.2 - (Math.random() * 0.5));
    const tiempoFinal = Math.round(tiempoBase + (Math.random() * 10) - 5); // Ruido de +/- 1 minuto

    datos.push({
      value: tiempoFinal,
      date: `${(i) % 30 + 1}/${Math.ceil(i/30)}/2025`, // Formato día/mes aproximado
      label: `${(i) % 30 + 1}/${Math.ceil(i/30)}`
    });
  }
  return datos;
};

const reduceDataAmount = (data : any[], factor : number)=> {
  if(factor < data.length && factor <= 1) return data;
  let reduced = data.reduce((acc, item, index) => {
    if (index % factor === 0) {
        acc.push(item);
        acc[acc.length - 1].date = item.date;
        if(Math.floor(index / factor) % 2 === 0){
            acc[acc.length - 1].label = '';
        }
    }
    else{
        acc[acc.length - 1].value += item.value;
        if((index + 1) % factor === 0){
            acc[acc.length - 1].date += `- ${item.date}`;
        }
    }
    return acc;
  }, []);

  return reduced.map(item => ({
    ...item,
    value: Math.round(item.value / factor)
  }));
}

// --- 3. EL COMPONENTE PRINCIPAL ---
export default function StatsLineChart({ data }: { data: { value: number; date: string; label: string }[] }) {
    const totalDataPoints = 1000;
    const dots = 20;
  // Generamos un gran conjunto de datos (por ejemplo, 100 días)
    const chartData = reduceDataAmount(data, data.length / dots); 
    console.log("Line chart data:", chartData);
        return (
            <View style={styles.contenedorFijo}>
                <LineChart
                // --- DATOS ---
                areaChart
                color="#1E90FF"
                startFillColor="#87CEFA"
                endFillColor="white"
                data={chartData}
                spacing={500*1/dots}
                width={Dimensions.get('window').width * 0.45} // 70% del ancho de la pantalla
                
                // --- CONFIGURACIÓN DE LÍNEA Y PUNTOS ---
                curved
                dataPointsRadius={5}
                dataPointsColor="#1E90FF"
                
                // --- EJE X (DÍAS MUESTREADOS) ---
                initialSpacing={0}
                xAxisLabelTextStyle={styles.etiquetaEjeX}
                xAxisColor="#D3D3D3"
                
                // --- EJE Y (TIEMPO EN MINUTOS) ---
                noOfSections={5}
                //   maxValue={Math.ceil(maxValue / 5) * 5} // Redondea al múltiplo de 5 superior
                yAxisLabelSuffix={' min'} 
                yAxisTextStyle={styles.etiquetaEjeY}
                yAxisColor="#D3D3D3"
                
                pointerConfig={{
                    pointerStripUptoDataPoint: true,
                    pointerStripColor: 'red',
                    pointerStripWidth: 2,
                    strokeDashArray: [2, 5],
                    pointerColor: 'cyan',
                    radius: 5,
                    pointerLabelWidth: 100,
                    pointerLabelHeight: 120,
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

                
                // --- ESTILOS ---
                
                />
            </View>
    );
};

// --- 4. ESTILOS ---
const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // EL CONTENEDOR DE TAMAÑO FIJO CLAVE
  contenedorFijo: {
    
    padding: 20,
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