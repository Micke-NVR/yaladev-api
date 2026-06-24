import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    LogBox,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

const API_BASE = 'https://yaladev-api.onrender.com/metas/hoy';

// ─── Colores ─────────────────────────────────────────────────────────────────
const C = {
    bg:           '#080B10',
    surface:      '#0D1117',
    surfaceRaise: '#131920',
    border:       '#1C2730',
    borderBright: '#1E3A4A',
    cyan:         '#00D4FF',
    cyanDim:      '#003D4D',
    cyanText:     '#7FE8FF',
    green:        '#00FF88',
    greenDim:     '#002918',
    greenText:    '#6FEFBB',
    red:          '#FF3B5C',
    redDim:       '#2A0A12',
    redText:      '#FF8BA0',
    yellow:       '#FFB547',
    yellowDim:    '#2A1C00',
    purple:       '#A855F7',
    purpleDim:    '#1A0A2E',
    purpleText:   '#C084FC',
    muted:        '#4A5568',
    mutedText:    '#718096',
    white:        '#F0F6FC',
    dim:          '#8B949E',
};

// ─── Componentes base ─────────────────────────────────────────────────────────

const BarraTareas = ({ activas, total }: { activas: number; total: number }) => (
    <View style={{ flexDirection: 'row', gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
            <View key={i} style={{
                flex: 1, height: 6, borderRadius: 3,
                backgroundColor: i < activas ? C.cyan : C.border,
                opacity: i < activas ? 1 : 0.4,
            }} />
        ))}
    </View>
);

const BadgePrioridad = ({ nivel }: { nivel: string }) => {
    const colores: Record<string, { bg: string; text: string; dot: string }> = {
        Alta:  { bg: C.redDim,    text: C.redText,  dot: C.red    },
        Media: { bg: C.yellowDim, text: C.yellow,   dot: C.yellow },
        Baja:  { bg: C.cyanDim,   text: C.cyanText, dot: C.cyan   },
    };
    const s = colores[nivel] || colores['Baja'];
    return (
        <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 5,
            backgroundColor: s.bg, borderRadius: 6,
            paddingHorizontal: 8, paddingVertical: 4,
            borderWidth: 1, borderColor: s.dot + '44',
        }}>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: s.dot }} />
            <Text style={{ color: s.text, fontSize: 9, fontWeight: '900', letterSpacing: 1.5 }}>
                {nivel.toUpperCase()}
            </Text>
        </View>
    );
};

const BtnPrimario = ({
    label, onPress, disabled = false, color = C.cyan, colorTexto = C.bg,
}: {
    label: string; onPress: () => void; disabled?: boolean; color?: string; colorTexto?: string;
}) => (
    <TouchableOpacity
        onPress={onPress} disabled={disabled} activeOpacity={0.75}
        style={{
            flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center',
            backgroundColor: disabled ? C.muted : color,
        }}
    >
        {disabled
            ? <ActivityIndicator color={colorTexto} />
            : <Text style={{ color: colorTexto, fontWeight: '900', fontSize: 13, letterSpacing: 0.5 }}>{label}</Text>}
    </TouchableOpacity>
);

const BtnSecundario = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <TouchableOpacity
        onPress={onPress} activeOpacity={0.75}
        style={{
            flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center',
            backgroundColor: C.surfaceRaise, borderWidth: 1, borderColor: C.border,
        }}
    >
        <Text style={{ color: C.mutedText, fontWeight: '900', fontSize: 13, letterSpacing: 0.5 }}>{label}</Text>
    </TouchableOpacity>
);

const TituloSeccion = ({ label }: { label: string }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <View style={{ width: 3, height: 14, backgroundColor: C.cyan, borderRadius: 2 }} />
        <Text style={{ color: C.mutedText, fontSize: 9, fontWeight: '900', letterSpacing: 2 }}>{label}</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
    </View>
);

const CampoTexto = (props: React.ComponentProps<typeof TextInput>) => (
    <TextInput
        {...props}
        placeholderTextColor={C.muted}
        style={[{
            backgroundColor: C.bg,
            borderWidth: 1, borderColor: C.borderBright,
            color: C.white, borderRadius: 12,
            padding: 16, fontWeight: '700', fontSize: 15,
            marginBottom: 16,
        }, props.style]}
    />
);

// ─── Modal tipo hoja desde abajo ──────────────────────────────────────────────
const ModalHoja = ({
    visible, onClose, accentColor = C.cyan, title, children,
}: {
    visible: boolean; onClose: () => void; accentColor?: string; title: string; children: React.ReactNode;
}) => (
    <Modal visible={visible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#000000CC' }}>
            <View style={{
                backgroundColor: C.surface,
                borderTopWidth: 1, borderTopColor: accentColor,
                borderTopLeftRadius: 28, borderTopRightRadius: 28,
                padding: 24, paddingBottom: 36,
            }}>
                <View style={{
                    width: 36, height: 4, backgroundColor: C.border,
                    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
                }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Text style={{ color: accentColor, fontSize: 18, fontWeight: '900', letterSpacing: 1 }}>{title}</Text>
                    <TouchableOpacity onPress={onClose} style={{
                        backgroundColor: C.surfaceRaise, borderRadius: 8,
                        paddingHorizontal: 12, paddingVertical: 6,
                        borderWidth: 1, borderColor: C.border,
                    }}>
                        <Text style={{ color: C.mutedText, fontSize: 11, fontWeight: '900' }}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
                {children}
            </View>
        </View>
    </Modal>
);

// ─── Modal pantalla completa ──────────────────────────────────────────────────
const ModalCompleto = ({
    visible, onClose, accentColor = C.cyan, title, children,
}: {
    visible: boolean; onClose: () => void; accentColor?: string; title: string; children: React.ReactNode;
}) => (
    <Modal visible={visible} animationType="slide" transparent={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 4, height: 22, backgroundColor: accentColor, borderRadius: 2 }} />
                    <Text style={{ color: accentColor, fontSize: 20, fontWeight: '900', letterSpacing: 1 }}>{title}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={{
                    backgroundColor: C.surfaceRaise, borderRadius: 8,
                    paddingHorizontal: 14, paddingVertical: 7,
                    borderWidth: 1, borderColor: C.border,
                }}>
                    <Text style={{ color: C.mutedText, fontSize: 11, fontWeight: '900' }}>Cerrar</Text>
                </TouchableOpacity>
            </View>
            {children}
        </SafeAreaView>
    </Modal>
);

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function FocusScreen() {
    const [tareas, setTareas]         = useState<any[]>([]);
    const [historial, setHistorial]   = useState<any[]>([]);
    const [notas, setNotas]           = useState<any[]>([]);
    const [cargando, setCargando]     = useState(false);
    const [racha, setRacha]           = useState(0); // días seguidos con al menos 1 tarea completada

    const [modalNuevaTarea, setModalNuevaTarea]   = useState(false);
    const [modalAbandonar, setModalAbandonar]     = useState(false);
    const [modalHistorial, setModalHistorial]     = useState(false);
    const [modalNotas, setModalNotas]             = useState(false);
    const [tabNotas, setTabNotas]                 = useState<'escribir' | 'ver'>('escribir');

    const [titulo, setTitulo]               = useState('');
    const [prioridad, setPrioridad]         = useState('Alta');
    const [tareaAbandonada, setTareaAbandonada] = useState<any>(null);
    const [razonAbandono, setRazonAbandono] = useState('');
    const [notaTexto, setNotaTexto]         = useState('');
    const [categoriaNote, setCategoriaNote] = useState('General');
    const [filtroEstado, setFiltroEstado]   = useState('Todos');
    const [filtrFecha, setFiltrFecha]       = useState('');

    // Animación del punto de estado
    const pulso = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulso, { toValue: 0.3, duration: 800, useNativeDriver: true }),
                Animated.timing(pulso, { toValue: 1,   duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    // ── Notificaciones ────────────────────────────────────────────────────────
    const programarRecordatorios = async (tareasPendientes: any[]) => {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('recordatorios', {
                name: 'Recordatorios de tareas',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
            });
        }

        await Notifications.cancelAllScheduledNotificationsAsync();
        if (tareasPendientes.length === 0) return;

        // Notificación a las 8pm: menciona la primera tarea pendiente
        const primera = tareasPendientes[0];
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '📋 Tienes tareas pendientes',
                body: tareasPendientes.length === 1
                    ? `"${primera.titulo}" sigue sin completarse.`
                    : `"${primera.titulo}" y ${tareasPendientes.length - 1} tarea(s) más sin completar.`,
                sound: true,
            },
            trigger: { type: 'date', date: (() => { const d = new Date(); d.setHours(20,0,0,0); if (new Date() >= d) d.setDate(d.getDate()+1); return d; })(), channelId: 'recordatorios' } as any,
        });

        // Ultimátum a las 11:30pm
        const nombres = tareasPendientes.slice(0, 2).map(t => `"${t.titulo}"`).join(', ');
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '⏰ Últimos 30 minutos del día',
                body: `Aún pendiente: ${nombres}${tareasPendientes.length > 2 ? ' y más...' : '.'}`,
                sound: true,
            },
            trigger: { type: 'date', date: (() => { const d = new Date(); d.setHours(23,30,0,0); if (new Date() >= d) d.setDate(d.getDate()+1); return d; })(), channelId: 'recordatorios' } as any,
        });
    };

    // ── Carga de datos ────────────────────────────────────────────────────────
    // programarRecordatorios se llama con un flag para evitar que se dispare
    // en cada recarga (agregar/completar tarea). Solo se programa al abrir la app.
    const cargarTareas = (reprogramarNotifs = false) => {
        fetch(`${API_BASE}/metas/hoy`)
            .then(r => r.json())
            .then(data => {
                const lista = Array.isArray(data) ? data : [];
                setTareas(lista);
                if (reprogramarNotifs) {
                    programarRecordatorios(lista.filter(t => t.estado === 'Pendiente'));
                }
            })
            .catch(console.error);
    };

    const cargarHistorial = () => {
        fetch(`${API_BASE}/metas/historial`)
            .then(r => r.json())
            .then(data => {
                const lista = Array.isArray(data) ? data : [];
                setHistorial(lista);
                // Calcular racha: días consecutivos con al menos 1 tarea completada
                calcularRacha(lista);
            })
            .catch(console.error);
    };

    const cargarNotas = () => {
        fetch(`${API_BASE}/incubadora`)
            .then(r => r.json())
            .then(data => setNotas(Array.isArray(data) ? data : []))
            .catch(console.error);
    };

    const calcularRacha = (lista: any[]) => {
        // Agrupar por fecha y ver cuáles tienen al menos 1 "Realizado"
        const porFecha: Record<string, boolean> = {};
        lista.forEach(item => {
            if (item.fecha_corta && item.estado === 'Realizado') {
                porFecha[item.fecha_corta] = true;
            }
        });
        const fechasConExito = Object.keys(porFecha).sort().reverse();
        let contador = 0;
        const hoy = new Date();
        for (let i = 0; i < fechasConExito.length; i++) {
            const esperada = new Date(hoy);
            esperada.setDate(hoy.getDate() - i);
            const esperadaStr = esperada.toISOString().split('T')[0];
            if (fechasConExito[i] === esperadaStr) contador++;
            else break;
        }
        setRacha(contador);
    };

    useEffect(() => {
        cargarTareas(true); // solo aquí se programan las notificaciones
        cargarHistorial();
        Notifications.requestPermissionsAsync();
    }, []);

    // ── Acciones ──────────────────────────────────────────────────────────────
    const agregarTarea = () => {
        if (!titulo.trim()) return;
        setCargando(true);
        fetch(`${API_BASE}/metas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, urgencia: prioridad }),
        })
            .then(r => r.json())
            .then(data => {
                setCargando(false);
                if (data.error) Alert.alert('No se pudo agregar', data.error);
                else { setModalNuevaTarea(false); setTitulo(''); cargarTareas(); }
            });
    };

    const marcarHecha = (id: number) => {
        setCargando(true);
        fetch(`${API_BASE}/metas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'Realizado' }),
        }).then(() => { setCargando(false); cargarTareas(); cargarHistorial(); });
    };

    const iniciarAbandono = (tarea: any) => {
        setTareaAbandonada(tarea);
        setRazonAbandono('');
        setModalAbandonar(true);
    };

    const confirmarAbandono = () => {
        if (!razonAbandono.trim()) {
            Alert.alert('Falta la razón', 'Escribe por qué no pudiste completarla.');
            return;
        }
        setCargando(true);
        fetch(`${API_BASE}/metas/${tareaAbandonada.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'Fallido', motivo_fallo: razonAbandono }),
        }).then(() => {
            setCargando(false);
            setModalAbandonar(false);
            setTareaAbandonada(null);
            cargarTareas();
            cargarHistorial();
        });
    };

    const guardarNota = () => {
        if (!notaTexto.trim()) return;
        setCargando(true);
        fetch(`${API_BASE}/incubadora`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ concepto: notaTexto, categoria: categoriaNote }),
        })
            .then(r => r.json())
            .then(() => { setCargando(false); setNotaTexto(''); cargarNotas(); setTabNotas('ver'); })
            .catch(() => { setCargando(false); Alert.alert('Sin conexión', 'No se pudo guardar la nota.'); });
    };

    const borrarNota = (id: number) => {
        fetch(`${API_BASE}/incubadora/${id}`, { method: 'DELETE' })
            .then(() => cargarNotas())
            .catch(() => Alert.alert('Sin conexión', 'No se pudo borrar.'));
    };

    // Convierte una nota en tarea del día
    const convertirNotaEnTarea = (nota: any) => {
        if (pendientes.length >= 5) {
            Alert.alert('Límite alcanzado', 'Ya tienes 5 tareas hoy. Completa alguna primero.');
            return;
        }
        setCargando(true);
        fetch(`${API_BASE}/metas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo: nota.concepto, urgencia: 'Media' }),
        })
            .then(r => r.json())
            .then(data => {
                setCargando(false);
                if (!data.error) {
                    borrarNota(nota.id); // elimina del bloc al convertirla
                    cargarTareas();
                    setModalNotas(false);
                    Alert.alert('✓ Listo', `"${nota.concepto}" se agregó a tus tareas de hoy.`);
                }
            })
            .catch(() => setCargando(false));
    };

    const abrirHistorial = () => {
        cargarHistorial();
        setFiltroEstado('Todos');
        setFiltrFecha('');
        setModalHistorial(true);
    };

    const abrirNotas = () => {
        cargarNotas();
        setTabNotas('escribir');
        setModalNotas(true);
    };

    // ── Datos derivados ───────────────────────────────────────────────────────
    const pendientes  = tareas.filter(t => t.estado === 'Pendiente');
    const completadas = tareas.filter(t => t.estado === 'Realizado');
    const histFiltrado = historial.filter(item => {
        const porEstado = filtroEstado === 'Todos' || item.estado === filtroEstado;
        const porFecha  = item.fecha_corta ? item.fecha_corta.includes(filtrFecha) : true;
        return porEstado && porFecha;
    });

    const colorEstado = pendientes.length === 0 ? C.green : pendientes.length >= 4 ? C.red : C.yellow;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, padding: 20 }}>

            {/* HEADER */}
            <View style={{
                backgroundColor: C.surface, borderRadius: 18,
                padding: 18, marginBottom: 16,
                borderWidth: 1, borderColor: C.border,
            }}>
                {/* Fila superior */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    {/* Racha de días */}
                    {racha > 0 ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ fontSize: 18 }}>🔥</Text>
                            <View>
                                <Text style={{ color: C.yellow, fontSize: 14, fontWeight: '900' }}>
                                    {racha} {racha === 1 ? 'día seguido' : 'días seguidos'}
                                </Text>
                                <Text style={{ color: C.muted, fontSize: 10 }}>completando tareas</Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={{ color: C.muted, fontSize: 12, fontWeight: '700' }}>Sin racha aún</Text>
                    )}
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={abrirHistorial}
                            style={{
                                backgroundColor: C.surfaceRaise, borderRadius: 10,
                                paddingHorizontal: 12, paddingVertical: 8,
                                borderWidth: 1, borderColor: C.borderBright,
                            }}
                        >
                            <Text style={{ color: C.dim, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 }}>Historial</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={abrirNotas}
                            style={{
                                backgroundColor: C.purpleDim, borderRadius: 10,
                                paddingHorizontal: 12, paddingVertical: 8,
                                borderWidth: 1, borderColor: C.purple + '55',
                            }}
                        >
                            <Text style={{ color: C.purpleText, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 }}>
                                Bloc{notas.length > 0 ? ` (${notas.length})` : ''}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Barra de tareas activas */}
                <View style={{ marginBottom: 2 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ color: C.mutedText, fontSize: 9, fontWeight: '700', letterSpacing: 2 }}>
                            TAREAS DE HOY
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Animated.View style={{
                                width: 6, height: 6, borderRadius: 3,
                                backgroundColor: colorEstado,
                                opacity: pendientes.length > 0 ? pulso : 1,
                            }} />
                            <Text style={{ color: colorEstado, fontSize: 11, fontWeight: '900' }}>
                                {pendientes.length} / 5 pendientes
                            </Text>
                        </View>
                    </View>
                    <BarraTareas activas={pendientes.length} total={5} />
                </View>
            </View>

            {/* LISTA DE TAREAS */}
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {pendientes.length === 0 ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
                        <View style={{
                            width: 72, height: 72, borderRadius: 36,
                            backgroundColor: C.greenDim, borderWidth: 1, borderColor: C.green + '33',
                            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                        }}>
                            <Text style={{ fontSize: 32 }}>✓</Text>
                        </View>
                        <Text style={{ color: C.greenText, fontWeight: '900', fontSize: 15 }}>
                            Todo listo por hoy
                        </Text>
                        <Text style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>
                            No tienes tareas pendientes
                        </Text>
                    </View>
                ) : (
                    pendientes.map(tarea => (
                        <View key={tarea.id} style={{
                            backgroundColor: C.surface, borderRadius: 16,
                            padding: 18, marginBottom: 12,
                            borderWidth: 1, borderColor: C.border,
                        }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <BadgePrioridad nivel={tarea.urgencia} />
                            </View>
                            <Text style={{ color: C.white, fontSize: 17, fontWeight: '800', marginBottom: 18, lineHeight: 24 }}>
                                {tarea.titulo}
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <BtnSecundario label="No pude" onPress={() => iniciarAbandono(tarea)} />
                                <BtnPrimario label="¡Listo! ✓" onPress={() => marcarHecha(tarea.id)} disabled={cargando} />
                            </View>
                        </View>
                    ))
                )}

                {completadas.length > 0 && (
                    <View style={{ marginTop: 28, marginBottom: 20 }}>
                        <TituloSeccion label="COMPLETADAS HOY" />
                        {completadas.map(tarea => (
                            <View key={tarea.id} style={{
                                backgroundColor: C.greenDim, borderRadius: 12,
                                padding: 14, marginBottom: 8,
                                borderWidth: 1, borderColor: C.green + '22',
                                flexDirection: 'row', alignItems: 'center', gap: 10,
                            }}>
                                <Text style={{ color: C.green, fontWeight: '900' }}>✓</Text>
                                <Text style={{ color: C.greenText, fontWeight: '700', textDecorationLine: 'line-through', flex: 1 }}>
                                    {tarea.titulo}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* BOTÓN AGREGAR TAREA */}
            {pendientes.length < 5 && (
                <TouchableOpacity
                    onPress={() => setModalNuevaTarea(true)}
                    activeOpacity={0.8}
                    style={{
                        backgroundColor: C.cyanDim, borderRadius: 16,
                        paddingVertical: 18, alignItems: 'center',
                        marginTop: 12, borderWidth: 1, borderColor: C.cyan + '66',
                    }}
                >
                    <Text style={{ color: C.cyan, fontWeight: '900', fontSize: 14, letterSpacing: 1 }}>
                        + Agregar tarea
                    </Text>
                </TouchableOpacity>
            )}

            {/* MODAL: NUEVA TAREA */}
            <ModalHoja
                visible={modalNuevaTarea}
                onClose={() => setModalNuevaTarea(false)}
                accentColor={C.cyan}
                title="Nueva tarea"
            >
                <CampoTexto
                    placeholder="¿Qué tienes que hacer?"
                    value={titulo}
                    onChangeText={setTitulo}
                    autoFocus
                />
                <Text style={{ color: C.mutedText, fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 10 }}>
                    PRIORIDAD
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
                    {['Alta', 'Media', 'Baja'].map(nivel => {
                        const sel = prioridad === nivel;
                        const col: Record<string, string> = { Alta: C.red, Media: C.yellow, Baja: C.cyan };
                        const c = col[nivel];
                        return (
                            <TouchableOpacity
                                key={nivel}
                                onPress={() => setPrioridad(nivel)}
                                style={{
                                    flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center',
                                    backgroundColor: sel ? c + '22' : C.surfaceRaise,
                                    borderWidth: 1, borderColor: sel ? c : C.border,
                                }}
                            >
                                <Text style={{ color: sel ? c : C.muted, fontWeight: '800', fontSize: 12 }}>{nivel}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <BtnSecundario label="Cancelar" onPress={() => setModalNuevaTarea(false)} />
                    <BtnPrimario label="Agregar" onPress={agregarTarea} disabled={cargando} />
                </View>
            </ModalHoja>

            {/* MODAL: ABANDONAR TAREA */}
            <Modal visible={modalAbandonar} animationType="fade" transparent>
                <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#000000CC', padding: 20 }}>
                    <View style={{
                        backgroundColor: C.surface, borderRadius: 20,
                        padding: 24, borderWidth: 1, borderColor: C.red,
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <View style={{ width: 4, height: 20, backgroundColor: C.red, borderRadius: 2 }} />
                            <Text style={{ color: C.red, fontSize: 16, fontWeight: '900' }}>No pudiste completarla</Text>
                        </View>
                        <Text style={{ color: C.mutedText, fontSize: 12, marginBottom: 20 }}>
                            Tarea:{' '}
                            <Text style={{ color: C.white, fontWeight: '700' }}>{tareaAbandonada?.titulo}</Text>
                        </Text>
                        <Text style={{ color: C.mutedText, fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 8 }}>
                            ¿POR QUÉ NO PUDISTE? (obligatorio)
                        </Text>
                        <CampoTexto
                            placeholder="Escribe la razón..."
                            value={razonAbandono}
                            onChangeText={setRazonAbandono}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            style={{ minHeight: 90 }}
                        />
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <BtnSecundario label="Volver" onPress={() => setModalAbandonar(false)} />
                            <BtnPrimario
                                label="Guardar"
                                onPress={confirmarAbandono}
                                disabled={cargando}
                                color={C.red}
                                colorTexto="#fff"
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* MODAL: BLOC DE NOTAS */}
            <ModalCompleto
                visible={modalNotas}
                onClose={() => setModalNotas(false)}
                accentColor={C.purple}
                title="Bloc de notas"
            >
                {/* Tabs */}
                <View style={{
                    flexDirection: 'row', marginBottom: 20,
                    backgroundColor: C.surface, borderRadius: 12,
                    padding: 4, borderWidth: 1, borderColor: C.border,
                }}>
                    {[
                        { key: 'escribir', label: 'Nueva nota' },
                        { key: 'ver',      label: `Mis notas (${notas.length})` },
                    ].map(tab => (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setTabNotas(tab.key as 'escribir' | 'ver')}
                            style={{
                                flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
                                backgroundColor: tabNotas === tab.key ? C.purple : 'transparent',
                            }}
                        >
                            <Text style={{
                                color: tabNotas === tab.key ? '#fff' : C.muted,
                                fontWeight: '900', fontSize: 11, letterSpacing: 0.5,
                            }}>{tab.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {tabNotas === 'escribir' ? (
                    <View style={{ flex: 1 }}>
                        <CampoTexto
                            placeholder="Escribe lo que no quieres olvidar..."
                            value={notaTexto}
                            onChangeText={setNotaTexto}
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                            style={{ minHeight: 130 }}
                        />
                        <Text style={{ color: C.mutedText, fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 10 }}>
                            CATEGORÍA
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
                            {['Yaladev', 'Contenido', 'General'].map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => setCategoriaNote(cat)}
                                    style={{
                                        flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center',
                                        backgroundColor: categoriaNote === cat ? C.purpleDim : C.surfaceRaise,
                                        borderWidth: 1, borderColor: categoriaNote === cat ? C.purple : C.border,
                                    }}
                                >
                                    <Text style={{
                                        color: categoriaNote === cat ? C.purpleText : C.muted,
                                        fontWeight: '800', fontSize: 11,
                                    }}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <BtnPrimario
                            label="Guardar nota"
                            onPress={guardarNota}
                            disabled={cargando}
                            color={C.purple}
                            colorTexto="#fff"
                        />
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {notas.length === 0 ? (
                            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                                <Text style={{ color: C.muted, fontWeight: '700', fontSize: 13 }}>
                                    No tienes notas guardadas
                                </Text>
                            </View>
                        ) : (
                            notas.map(nota => (
                                <View key={nota.id} style={{
                                    backgroundColor: C.surface, borderRadius: 14,
                                    padding: 16, marginBottom: 10,
                                    borderWidth: 1, borderColor: C.border,
                                }}>
                                    {/* Encabezado de la nota */}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <View style={{
                                            backgroundColor: C.purpleDim, borderRadius: 6,
                                            paddingHorizontal: 8, paddingVertical: 3,
                                            borderWidth: 1, borderColor: C.purple + '44',
                                        }}>
                                            <Text style={{ color: C.purpleText, fontSize: 9, fontWeight: '900', letterSpacing: 1 }}>
                                                {nota.categoria}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => borrarNota(nota.id)}
                                            style={{
                                                backgroundColor: C.redDim, borderRadius: 6,
                                                paddingHorizontal: 10, paddingVertical: 4,
                                                borderWidth: 1, borderColor: C.red + '44',
                                            }}
                                        >
                                            <Text style={{ color: C.redText, fontSize: 9, fontWeight: '900' }}>Borrar</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Texto de la nota */}
                                    <Text style={{ color: C.white, fontWeight: '700', fontSize: 14, lineHeight: 20, marginBottom: 12 }}>
                                        {nota.concepto}
                                    </Text>

                                    {/* Botón: convertir en tarea */}
                                    <TouchableOpacity
                                        onPress={() => convertirNotaEnTarea(nota)}
                                        disabled={pendientes.length >= 5}
                                        style={{
                                            backgroundColor: pendientes.length >= 5 ? C.surfaceRaise : C.cyanDim,
                                            borderRadius: 8, paddingVertical: 8, alignItems: 'center',
                                            borderWidth: 1,
                                            borderColor: pendientes.length >= 5 ? C.border : C.cyan + '55',
                                        }}
                                    >
                                        <Text style={{
                                            color: pendientes.length >= 5 ? C.muted : C.cyan,
                                            fontSize: 11, fontWeight: '900', letterSpacing: 0.5,
                                        }}>
                                            {pendientes.length >= 5 ? 'Límite de tareas alcanzado' : '→ Convertir en tarea de hoy'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </ScrollView>
                )}
            </ModalCompleto>

            {/* MODAL: HISTORIAL */}
            <ModalCompleto
                visible={modalHistorial}
                onClose={() => setModalHistorial(false)}
                accentColor={C.cyan}
                title="Historial"
            >
                <CampoTexto
                    placeholder="Buscar por fecha (ej: 2026-06-23)..."
                    value={filtrFecha}
                    onChangeText={setFiltrFecha}
                />
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                    {[
                        { key: 'Todos',    color: C.cyan  },
                        { key: 'Realizado', color: C.green },
                        { key: 'Fallido',  color: C.red   },
                    ].map(f => {
                        const activo = filtroEstado === f.key;
                        return (
                            <TouchableOpacity
                                key={f.key}
                                onPress={() => setFiltroEstado(f.key)}
                                style={{
                                    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
                                    backgroundColor: activo ? f.color + '22' : C.surface,
                                    borderWidth: 1, borderColor: activo ? f.color : C.border,
                                }}
                            >
                                <Text style={{
                                    color: activo ? f.color : C.muted,
                                    fontWeight: '900', fontSize: 10, letterSpacing: 0.5,
                                }}>
                                    {f.key === 'Todos' ? 'Todos' : f.key === 'Realizado' ? 'Completadas' : 'No completadas'}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Resumen de racha */}
                {racha > 0 && (
                    <View style={{
                        backgroundColor: C.yellowDim, borderRadius: 12,
                        padding: 14, marginBottom: 16,
                        borderWidth: 1, borderColor: C.yellow + '33',
                        flexDirection: 'row', alignItems: 'center', gap: 10,
                    }}>
                        <Text style={{ fontSize: 20 }}>🔥</Text>
                        <View>
                            <Text style={{ color: C.yellow, fontWeight: '900', fontSize: 14 }}>
                                {racha} {racha === 1 ? 'día seguido' : 'días seguidos'}
                            </Text>
                            <Text style={{ color: C.mutedText, fontSize: 11 }}>completando al menos una tarea</Text>
                        </View>
                    </View>
                )}

                <ScrollView showsVerticalScrollIndicator={false}>
                    {histFiltrado.length === 0 ? (
                        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                            <Text style={{ color: C.muted, fontWeight: '700', fontSize: 13 }}>Sin resultados</Text>
                        </View>
                    ) : (
                        histFiltrado.map(item => {
                            const esOk   = item.estado === 'Realizado';
                            const esFall = item.estado === 'Fallido';
                            const color  = esOk ? C.green : esFall ? C.red : C.cyan;
                            return (
                                <View key={item.id} style={{
                                    backgroundColor: C.surface, borderRadius: 14,
                                    padding: 16, marginBottom: 10,
                                    borderWidth: 1, borderColor: color + '33',
                                    borderLeftWidth: 3, borderLeftColor: color,
                                }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <Text style={{ color: C.muted, fontSize: 10, fontWeight: '700' }}>{item.fecha_corta}</Text>
                                        <View style={{
                                            backgroundColor: color + '22', borderRadius: 6,
                                            paddingHorizontal: 8, paddingVertical: 3,
                                            borderWidth: 1, borderColor: color + '44',
                                        }}>
                                            <Text style={{ color, fontSize: 9, fontWeight: '900', letterSpacing: 0.5 }}>
                                                {esOk ? 'Completada' : esFall ? 'No completada' : item.estado}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={{ color: C.white, fontSize: 15, fontWeight: '800', lineHeight: 22 }}>
                                        {item.titulo}
                                    </Text>
                                    {esFall && item.motivo_fallo && (
                                        <View style={{
                                            backgroundColor: C.redDim, borderRadius: 8,
                                            padding: 10, marginTop: 10,
                                            borderWidth: 1, borderColor: C.red + '33',
                                        }}>
                                            <Text style={{ color: C.redText, fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 4 }}>
                                                POR QUÉ NO PUDO
                                            </Text>
                                            <Text style={{ color: C.redText, fontSize: 12, fontStyle: 'italic' }}>
                                                {item.motivo_fallo}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            </ModalCompleto>
        </SafeAreaView>
    );
}