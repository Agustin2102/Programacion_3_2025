import React, {useEffect, useState} from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {ms: number; running: boolean; onEnd: () => void; };


/**
 * Componente para mostrar un temporizador en pantalla
 * @param {Props} props - Propiedades del componente
 * @param {number} props.ms - Tiempo en milisegundos
 * @param {boolean} props.running - Indica si el temporizador está corriendo
 * @param {() => void} props.onEnd - Función a ejecutar cuando el temporizador termina
 */
export const Timer: React.FC<Props> = ({ms, running, onEnd}) => {
    /**
     * Estado para almacenar el tiempo restante en segundos
     * @type {number}
     */
    const [seconds, setSeconds] = useState(Math.ceil(ms/1000));

    /**
     * Efecto para actualizar el tiempo restante
     * @param {boolean} running - Indica si el temporizador está corriendo
     * @param {() => void} onEnd - Función a ejecutar cuando el temporizador termina
     */
    useEffect(() => {
        if(!running) return;

        const id = setInterval(() => {
            setSeconds(s => {
                if(s <= 1) {
                    clearInterval(id);
                    onEnd();
                    return 0;
                }

                return s - 1;
            });
        }, 1000);

        return () => clearInterval(id);
    }, [running, onEnd]);

   if(!running) return null;

   return(
    <View style={styles.container}>
        <Text style={styles.text}>{seconds}</Text>
    </View>
   );
};

const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 50,
      right: 20,
      backgroundColor: 'rgba(0,0,0,0.7)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
    },
    text: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  });