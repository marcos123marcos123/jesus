/* ============ PROYECTO JESÚS — app.js ============ */
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const STORAGE_KEY = 'proyecto_jesus_v1';

const defaultState = {
  screen: 'welcome',
  stage: 0,
  theme: 'light',
  started: false,
  quizCompleted: false,
  quizAnswers: {},
  quizScore: 0,
  lockAttempts: 0,
  reflections: { q1: '', q2: '', q3: '' }
};

let state = JSON.parse(JSON.stringify(defaultState));

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return false;
    const saved = JSON.parse(raw);
    state = Object.assign({}, defaultState, saved, {
      reflections: Object.assign({}, defaultState.reflections, saved.reflections || {}),
      quizAnswers: saved.quizAnswers || {}
    });
    return !!saved.started;
  }catch(e){ return false; }
}
function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){}
}

/* =================== DATOS =================== */
const DATA = {};

DATA.intro = [
  { n:'I', title:'¿Quién fue Jesús?', text:'Jesús de Nazaret fue un maestro judío del siglo I. Los cristianos confiesan que es el Hijo de Dios hecho hombre. Su nombre hebreo, Yeshúa, significa «Dios salva».' },
  { n:'II', title:'Nacimiento y contexto', text:'Nació en Belén, en Judea, bajo el dominio del Imperio romano, en tiempos del rey Herodes el Grande. Los evangelios no precisan el día ni el año exactos de su nacimiento.' },
  { n:'III', title:'Familia y primeros años', text:'Creció en Nazaret de Galilea, hijo de María y de José, con hermanos. Aprendió el oficio de José. Lucas narra que a los doce años dialogaba con los maestros en el templo.' },
  { n:'IV', title:'El comienzo de su ministerio', text:'Hacia los treinta años fue bautizado por Juan el Bautista en el río Jordán. Después de ser tentado en el desierto, comenzó a predicar en Galilea: «Arrepentíos, que el reino de los cielos se ha acercado».' },
  { n:'V', title:'Su misión y propósito', text:'Anunciar el Reino de Dios, llamar a la conversión, mostrar la misericordia del Padre y entregar su vida en rescate por muchos, como él mismo lo expresó (Marcos 10:45).' }
];

DATA.timeline = [
  { when:'Siglo I a.C.', title:'Anuncio y nacimiento', ref:'Lucas 1:26-38; Lucas 2:1-20', text:'El ángel Gabriel anuncia a María el nacimiento de Jesús. Lucas sitúa el nacimiento en Belén, en tiempos del rey Herodes. La fecha tradicional del 25 de diciembre es una tradición posterior; el texto bíblico no la indica.' },
  { when:'Infancia', title:'Regreso a Nazaret', ref:'Mateo 2:19-23; Lucas 2:39-40', text:'Después de los relatos de la infancia, la familia se establece en Nazaret de Galilea, donde Jesús crece y se prepara para su misión.' },
  { when:'A los doce años', title:'Jesús en el templo', ref:'Lucas 2:41-52', text:'Lucas es el único evangelio que narra un episodio de la adolescencia de Jesús: hallado en el templo entre los maestros, asombrando a quienes lo escuchaban.' },
  { when:'Hacia los 30', title:'El bautismo en el Jordán', ref:'Mateo 3:13-17', text:'Jesús es bautizado por Juan el Bautista. Se oye una voz del cielo que lo declara Hijo amado. Con este episodio se abre su ministerio público.' },
  { when:'Desierto', title:'La tentación', ref:'Mateo 4:1-11', text:'Jesús es llevado al desierto y allí es tentado. Responde siempre con la Escritura, mostrando el camino de la fidelidad al Padre.' },
  { when:'Galilea', title:'Comienza la predicación', ref:'Mateo 4:12-17', text:'Tras el encarcelamiento de Juan, Jesús se traslada a Cafarnaún y proclama: «Arrepentíos, que el reino de los cielos se ha acercado».' },
  { when:'Lago de Galilea', title:'El llamado de los discípulos', ref:'Marcos 1:16-20', text:'Jesús llama a Pedro, Andrés, Santiago y Juan, que dejan sus redes para seguirlo. Más adelante llamará también a Mateo y a otros.' },
  { when:'Monte', title:'El Sermón del Monte', ref:'Mateo 5-7', text:'El gran discurso de Jesús: las bienaventuranzas, el Padre Nuestro, la regla de oro y las enseñanzas sobre el amor, el perdón y la confianza en Dios.' },
  { when:'Cesarea de Filipo', title:'La confesión de Pedro', ref:'Mateo 16:13-20', text:'Preguntado por sus discípulos, Pedro confiesa que Jesús es el Cristo, el Hijo de Dios vivo. Desde entonces Jesús anuncia su pasión.' },
  { when:'Monte alto', title:'La transfiguración', ref:'Mateo 17:1-8', text:'Ante Pedro, Santiago y Juan, el rostro de Jesús resplandece. Una voz del cielo repite: «Este es mi Hijo amado; a él oíd».' },
  { when:'Jerusalén', title:'La entrada en Jerusalén', ref:'Mateo 21:1-11', text:'Jesús entra en Jerusalén montado en un asno, entre aclamaciones. Con este gesto se abre la semana final de su vida.' }
];

DATA.teachings = [
  { id:'amor', kicker:'El mandamiento central', title:'El amor al prójimo', ref:'Mateo 22:37-39', verse:'Amarás al Señor tu Dios con todo tu corazón, y con toda tu alma, y con toda tu mente. Este es el primero y grande mandamiento. Y el segundo es semejante a este: Amarás a tu prójimo como a ti mismo.', explain:'Un maestro de la ley pregunta a Jesús cuál es el mandamiento más importante. Jesús no elige uno entre muchos: une el amor a Dios con el amor al prójimo, y con ello resume toda la ley.', meaning:'El amor no es un adorno del mensaje de Jesús: es su centro. Sin amor, cualquier cumplimiento exterior queda vacío.', apply:'Escuchar sin interrumpir. Ayudar a alguien que lo necesita sin esperar nada. Tratar con respeto a quien piensa distinto.' },
  { id:'perdon', kicker:'Liberar el corazón', title:'El perdón', ref:'Mateo 6:14', verse:'Porque si perdonáis a los hombres sus ofensas, os perdonará también a vosotros vuestro Padre celestial.', explain:'Pedro preguntó cuántas veces debía perdonar; Jesús respondió «hasta setenta veces siete» (Mateo 18:22), es decir, sin llevar la cuenta.', meaning:'El perdón no niega el daño ni lo justifica. Libera del rencor, abre camino a la reconciliación y se apoya en la misericordia de Dios.', apply:'Soltar un resentimiento que te pesa. Pedir perdón cuando has fallado. Buscar la reconciliación cuando sea posible y seguro.' },
  { id:'humildad', kicker:'Dejar de ser el centro', title:'La humildad', ref:'Mateo 11:29', verse:'Llevad mi yugo sobre vosotros, y aprended de mí, que soy manso y humilde de corazón; y hallaréis descanso para vuestras almas.', explain:'Jesús, siendo maestro, lava los pies de sus discípulos (Juan 13:14-15). La humildad no consiste en menospreciarse, sino en no necesitar ser siempre el centro.', meaning:'El camino de Jesús es descendente: servir, no dominar. La humildad hace posible la escucha y la corrección.', apply:'Reconocer un error sin excusas. Escuchar antes de opinar. Dar crédito a los demás por lo que hacen bien.' },
  { id:'misericordia', kicker:'Mirar con compasión', title:'La misericordia', ref:'Lucas 6:36', verse:'Sed, pues, misericordiosos, como también vuestro Padre es misericordioso.', explain:'Jesús se acerca a los enfermos, a los excluidos y a los pecadores. Su mirada no condena de entrada: ofrece una posibilidad nueva.', meaning:'La misericordia es la forma concreta que toma el amor cuando encuentra la fragilidad del otro.', apply:'No juzgar a la ligera. Dar una segunda oportunidad. Ayudar sin humillar a quien recibe la ayuda.' },
  { id:'fe', kicker:'Confiar aunque no se vea', title:'La fe', ref:'Mateo 17:20', verse:'Si tuvierais fe como un grano de mostaza, diríais a este monte: Pásate de aquí allá, y se pasará; y nada os será imposible.', explain:'Jesús no pide una fe espectacular, sino una fe real, aunque sea pequeña. La mostaza es una semilla mínima que llega a ser un arbusto grande.', meaning:'La fe es confianza activa en Dios; no es la ausencia de dudas, sino la decisión de seguir confiando.', apply:'Orar con sinceridad, incluso en la sequedad. Sostener la esperanza cuando los resultados no llegan. Dar un paso aunque no veas el final.' },
  { id:'justicia', kicker:'Defender al débil', title:'La justicia', ref:'Lucas 4:18', verse:'El Espíritu del Señor es sobre mí, por cuanto me ha ungido para anunciar el evangelio a los pobres; me ha enviado para sanar a los quebrantados de corazón, para pregonar libertad a los cautivos y vista a los ciegos, para poner en libertad a los oprimidos.', explain:'Jesús anuncia una buena noticia que incluye a los pobres, los quebrantados y los oprimidos. Su predicación tiene una dimensión clara de justicia.', meaning:'No se puede separar el amor de Dios del trato justo hacia las personas. La fe se mide también en cómo tratamos a los más vulnerables.', apply:'Ser justo en lo pequeño: en el trabajo, en el dinero, en la palabra dada. No aprovecharse de quien tiene menos poder.' },
  { id:'oracion', kicker:'Hablar con el Padre', title:'La oración', ref:'Mateo 6:9-13', verse:'Padre nuestro que estás en los cielos, santificado sea tu nombre. Venga tu reino. Sea hecha tu voluntad, como en el cielo, así también en la tierra. El pan nuestro de cada día, dánoslo hoy. Y perdónanos nuestras deudas, como también nosotros perdonamos a nuestros deudores. Y no nos metas en tentación, mas líbranos del mal.', explain:'Los evangelios muestran a Jesús orando con frecuencia, a solas y de madrugada. El Padre Nuestro es el modelo que dejó a sus discípulos.', meaning:'La oración no es un trámite: es relación. Reconoce a Dios como Padre y ordena la vida alrededor de su voluntad.', apply:'Reservar unos minutos diarios, sin prisa y sin ruido. Orar con palabras sencillas y propias.' },
  { id:'servicio', kicker:'Dar la vida por los demás', title:'El servicio', ref:'Marcos 10:45', verse:'Porque el Hijo del hombre tampoco vino para ser servido, mas para servir, y dar su vida en rescate por muchos.', explain:'En una cultura donde el grande manda, Jesús invierte la lógica: el que quiera ser el primero, que sea servidor de todos.', meaning:'El servicio es la manera en que el amor se vuelve tangible. No busca protagonismo ni recompensa.', apply:'Hacer una tarea humilde sin que nadie lo note. Ofrecer tu tiempo a alguien que lo necesita. Servir sin esperar devolución.' }
];

DATA.parables = [
  { title:'El hijo pródigo', ref:'Lucas 15:11-32', summary:'Un padre, dos hijos y un abrazo que lo cambia todo.', narration:'Un hombre tenía dos hijos. El menor pidió su herencia, se marchó lejos y la gastó viviendo desordenadamente. Cuando todo faltó, acabó cuidando cerdos y pasando necesidad. Entonces decidió volver, dispuesto a pedir perdón y a ser tratado como un jornalero. Pero cuando aún estaba lejos, su padre lo vio, se conmovió, corrió, se echó sobre su cuello y lo besó. Mandó vestirlo con la mejor ropa y hacer fiesta, porque «este mi hijo muerto era, y ha revivido» (Lucas 15:24). El hermano mayor, en cambio, se molestó al ver la celebración.', teaching:'Dios es un Padre que sale al encuentro y recibe al que vuelve. La parábola también advierte sobre el resentimiento del que se cree justo y no participa de la alegría del perdón.' },
  { title:'El buen samaritano', ref:'Lucas 10:25-37', summary:'La compasión no entiende de fronteras ni de etiquetas.', narration:'Un hombre bajaba de Jerusalén a Jericó y cayó en manos de unos ladrones, que lo dejaron medio muerto. Un sacerdote pasó de largo; también un levita. Pero un samaritano —miembro de un pueblo despreciado por los judíos— lo vio, fue movido a misericordia, vendó sus heridas, lo llevó a un mesón y pagó por su cuidado. Jesús termina preguntando: «¿Cuál de estos tres te parece que fue el prójimo del que cayó en los ladrones?» (Lucas 10:36).', teaching:'El prójimo no es solo el que está cerca, sino aquel a quien me acerco. Jesús pone como ejemplo a alguien inesperado: el amor verdadero cruza prejuicios.' },
  { title:'El sembrador', ref:'Mateo 13:1-23', summary:'Una misma semilla, distintos terrenos.', narration:'Un sembrador salió a sembrar. Parte de la semilla cayó junto al camino y las aves la comieron; parte cayó en pedregales y, sin raíz, se secó pronto; parte cayó entre espinos, que la ahogaron; y parte cayó en buena tierra y dio fruto: a ciento, a sesenta y a treinta por uno.', teaching:'La palabra de Dios da fruto según la disposición del corazón. La parábola invita a preguntarse qué tipo de terreno soy y a cuidar la tierra de mi vida.' },
  { title:'La oveja perdida', ref:'Lucas 15:3-7', summary:'Dejar las noventa y nueve para ir por una.', narration:'Un pastor tiene cien ovejas y pierde una. ¿No deja las noventa y nueve en el desierto y va tras la que se perdió hasta encontrarla? Y cuando la encuentra, la pone sobre sus hombros con gozo, y al llegar a casa reúne a sus amigos y dice: «Gozaos conmigo, porque he hallado mi oveja que se había perdido».', teaching:'Jesús revela un Dios que busca al que se ha perdido y se alegra cuando regresa. Nadie está tan lejos como para quedar fuera de esa búsqueda.' },
  { title:'Los talentos', ref:'Mateo 25:14-30', summary:'Lo que recibimos se multiplica cuando se pone en juego.', narration:'Un hombre, antes de partir de viaje, entregó sus bienes a sus siervos: a uno cinco talentos, a otro dos, a otro uno, a cada uno según su capacidad. Los dos primeros negociaron y duplicaron lo recibido. El tercero, por miedo, enterró su talento. Al volver el señor, alabó a los dos primeros y reprendió al que no hizo nada con lo que había recibido.', teaching:'Los dones recibidos no son para esconderlos, sino para ponerlos al servicio. El miedo paraliza; la confianza activa. La medida no es cuánto recibes, sino qué haces con ello.' },
  { title:'El buen pastor', ref:'Juan 10:1-18', summary:'Conocer la voz y dar la vida por las ovejas.', narration:'Jesús se presenta como el buen pastor. El pastor entra por la puerta, las ovejas conocen su voz y lo siguen. El asalariado, en cambio, huye ante el peligro porque las ovejas no son suyas. «Yo soy el buen pastor: el buen pastor su vida da por las ovejas» (Juan 10:11).', teaching:'Jesús se ofrece libremente por los suyos. Su autoridad no es la del que domina, sino la del que entrega la vida. Conocer su voz supone escucha y cercanía.' }
];

DATA.miracles = [
  { title:'Las bodas de Caná', ref:'Juan 2:1-11', summary:'El primer signo: agua convertida en vino.', context:'Jesús asiste a una boda en Caná de Galilea, con su madre y sus discípulos. Faltaba el vino, lo que en aquella cultura era una vergüenza para la familia anfitriona.', story:'María dice a Jesús: «No tienen vino». Jesús manda llenar seis tinajas de agua y llevarlas al encargado del banquete. El agua se había convertido en vino, y de mejor calidad que el anterior. Juan comenta: «Este principio de señales hizo Jesús en Caná de Galilea, y manifestó su gloria; y sus discípulos creyeron en él».', meaning:'El signo revela la abundancia del Reino: donde faltaba algo, aparece lo mejor. También muestra a Jesús atento a una necesidad concreta y cotidiana.' },
  { title:'La multiplicación de los panes', ref:'Mateo 14:13-21', summary:'Cinco panes y dos peces para una multitud.', context:'Una gran multitud sigue a Jesús en un lugar desierto. Se hace tarde y los discípulos proponen despedir a la gente para que compre comida.', story:'Jesús responde: «No tienen necesidad de irse; dadles vosotros de comer». Solo había cinco panes y dos peces. Jesús los bendice, los parte y los da a los discípulos, y los discípulos a la gente. Comieron todos y se saciaron; y recogieron doce cestas llenas de lo que sobró. Eran unos cinco mil hombres, sin contar mujeres y niños.', meaning:'Jesús no solo enseña: también alimenta. El milagro muestra compasión concreta y anticipa el sentido de la Eucaristía: el pan compartido que alcanza para todos.' },
  { title:'Jesús calma la tormenta', ref:'Marcos 4:35-41', summary:'Una palabra que pone paz en medio del caos.', context:'Al atardecer, Jesús y sus discípulos cruzan el lago en una barca. Se levanta una gran tempestad y las olas golpean la barca.', story:'Jesús dormía. Los discípulos lo despiertan asustados: «Maestro, ¿no tienes cuidado que perecemos?». Él se levanta, reprende al viento y dice al mar: «Calla, enmudece». El viento cesa y se hace gran bonanza. Después les pregunta: «¿Por qué estáis así amedrentados? ¿Cómo no tenéis fe?».', meaning:'El relato revela quién es Jesús: incluso el viento y el mar le obedecen. Y muestra que la fe no elimina las tormentas, pero permite atravesarlas con otra serenidad.' },
  { title:'La sanación de los enfermos', ref:'Marcos 1:40-45; Marcos 5:25-34; Marcos 10:46-52', summary:'Tocar, mirar y devolver la dignidad.', context:'Los evangelios narran numerosos encuentros de Jesús con personas enfermas y excluidas: un leproso, una mujer con hemorragias desde hacía doce años, un ciego llamado Bartimeo.', story:'Al leproso le dice: «Quiero, sé limpio». A la mujer que toca su manto le dice: «Hija, tu fe te ha salvado; ve en paz». Al ciego Bartimeo lo llama y le devuelve la vista. En todos los casos hay algo más que la curación: hay mirada, contacto y restitución de la dignidad.', meaning:'Los milagros de sanación muestran la compasión de Jesús y su cercanía con quienes la sociedad apartaba. El ser humano no es solo un cuerpo enfermo: es una persona que necesita ser reconocida.' },
  { title:'La resurrección de Lázaro', ref:'Juan 11:1-44', summary:'«Yo soy la resurrección y la vida».', context:'Lázaro, amigo de Jesús, enferma y muere en Betania. Sus hermanas Marta y María le envían aviso, pero Jesús llega cuando ya han pasado cuatro días.', story:'Marta le dice: «Señor, si hubieras estado aquí, mi hermano no habría muerto». Jesús responde: «Yo soy la resurrección y la vida: el que cree en mí, aunque esté muerto, vivirá». Jesús llora junto al sepulcro y luego clama: «¡Lázaro, ven fuera!». El que había muerto sale, y Jesús dice: «Desatadle, y dejadle ir».', meaning:'El signo anticipa la resurrección de Jesús. Dios no permanece indiferente ante el dolor: Jesús llora. Y su palabra abre camino donde parecía que todo había terminado.' }
];

DATA.passion = [
  { title:'La última cena', ref:'Mateo 26:26-29', text:'Jesús cena con sus discípulos antes de su muerte. Toma el pan, lo bendice, lo parte y lo da, diciendo: «Tomad, comed; esto es mi cuerpo». Y tomando la copa: «Bebed de ella todos; porque esto es mi sangre del nuevo pacto, que por muchos es derramada para remisión de los pecados». En esa misma cena lava los pies a sus discípulos y les da un mandamiento nuevo: que se amen unos a otros.' },
  { title:'La oración en Getsemaní', ref:'Mateo 26:36-46', text:'Después de la cena, Jesús va a un huerto llamado Getsemaní. Lleno de angustia, ora: «Padre mío, si posible es, pase de mí esta copa; pero no como yo quiero, sino como tú». Vuelve tres veces a sus discípulos y los encuentra dormidos. El relato muestra su humanidad real: miedo, sudor, súplica, y a la vez una confianza total en el Padre.' },
  { title:'La traición de Judas', ref:'Mateo 26:47-56', text:'Judas llega con una multitud armada y besa a Jesús: es la señal convenida para entregarlo. Jesús no responde con violencia; reprende a quien saca la espada y dice que podría pedir legiones de ángeles, pero no lo hace. Sus discípulos lo abandonan y huyen.' },
  { title:'El juicio', ref:'Mateo 26:57-27:26', text:'Jesús es llevado ante el sanedrín, donde es acusado y condenado por blasfemia. Pedro lo niega tres veces. Luego es presentado ante Pilato, el gobernador romano, que no encuentra culpa en él, pero cede ante la presión de la multitud y lo entrega para ser crucificado.' },
  { title:'La crucifixión', ref:'Lucas 23:33-46', text:'Jesús es crucificado en el Gólgota, entre dos malhechores. Desde la cruz perdona: «Padre, perdónalos, porque no saben lo que hacen». Promete al malhechor arrepentido estar con él en el paraíso. Ora con el salmo 22. Y finalmente dice: «Padre, en tus manos encomiendo mi espíritu», y expira. El centurión, al ver lo ocurrido, glorifica a Dios.' },
  { title:'La sepultura', ref:'Mateo 27:57-61', text:'José de Arimatea, un discípulo, pide el cuerpo a Pilato y lo coloca en un sepulcro nuevo, cavado en la roca, y hace rodar una gran piedra a la puerta. Las mujeres que habían seguido a Jesús desde Galilea observan dónde es puesto. Todo parece haber terminado.' },
  { title:'La resurrección', ref:'Mateo 28:1-10', text:'Al amanecer del primer día de la semana, las mujeres van al sepulcro y encuentran la piedra removida. Un ángel les anuncia: «No está aquí; porque ha resucitado, como dijo. Venid, ved el lugar donde fue puesto el Señor». Ellas salen con temor y gran gozo a anunciarlo a los discípulos, y Jesús les sale al encuentro. La resurrección es el centro de la fe cristiana: la muerte no tuvo la última palabra.' }
];

DATA.bookCats = [
  { id:'all', name:'Todos' },
  { id:'evangelios', name:'Evangelios' },
  { id:'hechos', name:'Hechos' },
  { id:'pablo', name:'Cartas de Pablo' },
  { id:'generales', name:'Cartas generales' },
  { id:'apocalipsis', name:'Apocalipsis' }
];

DATA.nt = [
  { n:'Mateo', c:'evangelios', a:'Atribuido al apóstol Mateo (Leví), publicano llamado por Jesús.', ctx:'Escrito para lectores de origen judío; muestra cómo Jesús cumple las promesas del Antiguo Testamento.', cont:'28 capítulos: genealogía y nacimiento, Sermón del Monte, parábolas del Reino, pasión y resurrección.', msg:'Jesús es el Mesías y Rey prometido; su Reino se ha acercado.' },
  { n:'Marcos', c:'evangelios', a:'Atribuido a Juan Marcos, colaborador de Pedro.', ctx:'Probablemente el evangelio más antiguo; destinado a lectores de ambiente romano, con ritmo rápido.', cont:'16 capítulos breves y ágiles, centrados en la acción de Jesús.', msg:'Jesús es el Hijo de Dios que sirve y da su vida; el discípulo está llamado a seguir ese camino.' },
  { n:'Lucas', c:'evangelios', a:'Lucas, médico y compañero de Pablo.', ctx:'Dedicado a Teófilo y a lectores de origen no judío; cuidado en el detalle histórico y en la mirada a los pobres.', cont:'24 capítulos: infancia de Jesús, parábolas de la misericordia, camino a Jerusalén, pasión y resurrección.', msg:'Jesús es el Salvador de todos los pueblos, cercano a los marginados y a los pecadores.' },
  { n:'Juan', c:'evangelios', a:'Atribuido a Juan, el discípulo amado.', ctx:'Escrito más tarde; estilo meditativo y teológico, con largos discursos de Jesús.', cont:'21 capítulos: el Verbo hecho carne, los signos, los «yo soy», el discurso de la última cena, pasión y resurrección.', msg:'Jesús es el Verbo de Dios hecho carne; quien cree en él tiene vida eterna.' },
  { n:'Hechos de los Apóstoles', c:'hechos', a:'Lucas, autor del tercer evangelio.', ctx:'Segunda parte de la obra de Lucas; narra los primeros decenios de la Iglesia.', cont:'28 capítulos: Pentecostés, la comunidad de Jerusalén, la misión de Pedro y la de Pablo hasta Roma.', msg:'El Espíritu Santo impulsa a la Iglesia a llevar el mensaje de Jesús hasta los confines del mundo.' },
  { n:'Romanos', c:'pablo', a:'Pablo, apóstol.', ctx:'Carta escrita a la comunidad de Roma, a la que Pablo aún no había visitado.', cont:'16 capítulos con la exposición más completa de su pensamiento.', msg:'Todos han pecado y son justificados gratuitamente por la fe en Cristo.' },
  { n:'1 Corintios', c:'pablo', a:'Pablo, apóstol.', ctx:'Escrita a una comunidad con muchos dones y también con divisiones y desórdenes.', cont:'16 capítulos sobre unidad, moral, Eucaristía, carismas y resurrección.', msg:'El amor es el camino más excelente; todo lo demás sin amor no vale nada.' },
  { n:'2 Corintios', c:'pablo', a:'Pablo, apóstol.', ctx:'Carta muy personal, escrita en un momento de tensiones con la comunidad.', cont:'13 capítulos con defensa de su ministerio y testimonio de consuelo en la aflicción.', msg:'La fuerza de Dios se manifiesta en la debilidad humana.' },
  { n:'Gálatas', c:'pablo', a:'Pablo, apóstol.', ctx:'Dirigida a comunidades de Galacia influidas por quienes exigían cumplir la ley de Moisés.', cont:'6 capítulos, de tono enérgico.', msg:'Cristo nos ha liberado; la salvación es por la fe y no por el cumplimiento externo de la ley.' },
  { n:'Efesios', c:'pablo', a:'Pablo, apóstol (tradicionalmente escrita en prisión).', ctx:'Carta circular sobre la identidad y la unidad de la Iglesia.', cont:'6 capítulos sobre la reconciliación en Cristo, la unidad y la vida nueva.', msg:'En Cristo, judíos y gentiles forman un solo pueblo; la Iglesia es su cuerpo.' },
  { n:'Filipenses', c:'pablo', a:'Pablo, apóstol, desde la prisión.', ctx:'Carta afectuosa a una comunidad que lo había apoyado económicamente.', cont:'4 capítulos breves, con un himno cristológico (2:5-11).', msg:'El gozo cristiano no depende de las circunstancias: nace de Cristo.' },
  { n:'Colosenses', c:'pablo', a:'Pablo, apóstol (tradicionalmente escrita en prisión).', ctx:'Escrita frente a enseñanzas que relativizaban la persona de Cristo.', cont:'4 capítulos sobre la primacía de Cristo y la vida nueva.', msg:'Cristo es la imagen del Dios invisible y la cabeza de todo; en él está la plenitud.' },
  { n:'1 Tesalonicenses', c:'pablo', a:'Pablo, apóstol.', ctx:'Probablemente uno de los escritos más antiguos del Nuevo Testamento.', cont:'5 capítulos con recuerdos personales y enseñanzas sobre la venida del Señor.', msg:'La esperanza en el regreso de Cristo sostiene la vida y el trabajo cotidiano.' },
  { n:'2 Tesalonicenses', c:'pablo', a:'Pablo, apóstol.', ctx:'Escrita para aclarar malentendidos sobre la segunda venida.', cont:'3 capítulos breves.', msg:'La espera del Señor no es motivo para el desorden, sino para la perseverancia.' },
  { n:'1 Timoteo', c:'pablo', a:'Pablo, apóstol, dirigida a Timoteo.', ctx:'Instrucciones a un colaborador joven al frente de una comunidad.', cont:'6 capítulos sobre organización, sana doctrina y conducta de los responsables.', msg:'La comunidad se edifica con enseñanza fiel y testimonio coherente.' },
  { n:'2 Timoteo', c:'pablo', a:'Pablo, apóstol, dirigida a Timoteo.', ctx:'Considerada su última carta, escrita en prisión y con conciencia del final.', cont:'4 capítulos de tono muy personal.', msg:'Guardar la fe y anunciar la Palabra a tiempo y a destiempo, aunque cueste.' },
  { n:'Tito', c:'pablo', a:'Pablo, apóstol, dirigida a Tito.', ctx:'Instrucciones para organizar las comunidades de la isla de Creta.', cont:'3 capítulos.', msg:'La gracia de Dios enseña a vivir de manera coherente y a hacer el bien.' },
  { n:'Filemón', c:'pablo', a:'Pablo, apóstol.', ctx:'Nota breve dirigida a un cristiano llamado Filemón, sobre su esclavo Onésimo.', cont:'1 capítulo.', msg:'La fe transforma las relaciones: Onésimo vuelve como hermano, no solo como siervo.' },
  { n:'Hebreos', c:'generales', a:'Autor desconocido; tradicionalmente se ha asociado a Pablo, pero su autoría es discutida.', ctx:'Escrita a cristianos de origen judío tentados a volver atrás.', cont:'13 capítulos de gran profundidad sobre el sacerdocio de Cristo.', msg:'Cristo es el sumo sacerdote perfecto y el mediador de una alianza nueva y definitiva.' },
  { n:'Santiago', c:'generales', a:'Atribuida a Santiago, hermano del Señor y responsable de la comunidad de Jerusalén.', ctx:'Carta práctica, de estilo sapiencial y muy cercano a las enseñanzas de Jesús.', cont:'5 capítulos sobre la fe puesta en práctica.', msg:'La fe sin obras está muerta; el verdadero culto se muestra en el trato al pobre y en el dominio de la lengua.' },
  { n:'1 Pedro', c:'generales', a:'Atribuida al apóstol Pedro.', ctx:'Dirigida a comunidades que sufrían hostilidad por su fe.', cont:'5 capítulos.', msg:'El sufrimiento vivido con esperanza tiene sentido; somos pueblo de Dios.' },
  { n:'2 Pedro', c:'generales', a:'Atribuida al apóstol Pedro; su autoría es discutida entre los estudiosos.', ctx:'Escrita para advertir contra falsos maestros y el desaliento.', cont:'3 capítulos.', msg:'Crecer en el conocimiento de Cristo y esperar con paciencia el día del Señor.' },
  { n:'1 Juan', c:'generales', a:'Atribuida a Juan, el discípulo amado.', ctx:'Carta de tono meditativo y cercano, frente a divisiones en la comunidad.', cont:'5 capítulos breves.', msg:'Dios es amor; quien ama ha nacido de Dios, y el amor se muestra en obras concretas.' },
  { n:'2 Juan', c:'generales', a:'Atribuida a Juan, «el anciano».', ctx:'Nota breve a una comunidad, frente a maestros que negaban la encarnación.', cont:'1 capítulo.', msg:'Mantener la verdad y caminar en el amor.' },
  { n:'3 Juan', c:'generales', a:'Atribuida a Juan, «el anciano».', ctx:'Nota personal a Gayo, sobre la hospitalidad y el buen testimonio.', cont:'1 capítulo.', msg:'Apoyar a quienes anuncian la verdad y no imitar el ejemplo de quien busca protagonismo.' },
  { n:'Judas', c:'generales', a:'Atribuida a Judas, hermano de Santiago.', ctx:'Carta breve frente a enseñanzas que llevaban a la relajación moral.', cont:'1 capítulo.', msg:'Contender firmemente por la fe transmitida, sostenidos por la misericordia de Dios.' },
  { n:'Apocalipsis', c:'apocalipsis', a:'Atribuido a Juan, que escribe desde la isla de Patmos.', ctx:'Escrito en un contexto de persecución, con un lenguaje simbólico muy característico del género apocalíptico.', cont:'22 capítulos de visiones: las cartas a las siete iglesias, el Cordero, la lucha contra el mal y la Jerusalén nueva.', msg:'Pese a la persecución, Cristo es el Señor de la historia; la victoria final es de la vida, no de la muerte.' }
];

/* =================== LAS 10 PREGUNTAS DEL CUESTIONARIO =================== */
DATA.quiz = [
  {
    q: '¿Dónde creció Jesús?',
    opts: ['En Belén de Judea', 'En Nazaret de Galilea', 'En Jerusalén', 'En Cafarnaún'],
    correct: 1,
    explain: 'Los evangelios presentan a Jesús creciendo en Nazaret de Galilea, aunque nació en Belén (Lucas 2:39-40; Mateo 2:23).'
  },
  {
    q: '¿Quién bautizó a Jesús en el río Jordán?',
    opts: ['Juan el Bautista', 'El apóstol Pedro', 'El ángel Gabriel', 'El profeta Elías'],
    correct: 0,
    explain: 'Jesús fue bautizado por Juan el Bautista en el Jordán, y una voz del cielo lo declaró Hijo amado (Mateo 3:13-17).'
  },
  {
    q: 'Según Jesús, ¿cuál es el mandamiento más importante?',
    opts: ['Guardar el sábado', 'Amar a Dios sobre todo y al prójimo como a ti mismo', 'No comer carne de cerdo', 'Ir al templo todos los días'],
    correct: 1,
    explain: 'Jesús unió el amor a Dios con el amor al prójimo y dijo que de estos dos mandamientos depende toda la ley (Mateo 22:37-39).'
  },
  {
    q: '¿Cuántas veces enseñó Jesús que debemos perdonar?',
    opts: ['Tres veces', 'Siete veces', 'Setenta veces siete', 'Una sola vez'],
    correct: 2,
    explain: 'Pedro preguntó si siete veces era suficiente; Jesús respondió «hasta setenta veces siete», es decir, sin llevar la cuenta (Mateo 18:22).'
  },
  {
    q: 'En la parábola, ¿quién ayudó al hombre herido en el camino a Jericó?',
    opts: ['Un samaritano', 'Un sacerdote', 'Un levita', 'Un soldado romano'],
    correct: 0,
    explain: 'El sacerdote y el levita pasaron de largo; fue un samaritano quien se compadeció y lo cuidó (Lucas 10:25-37).'
  },
  {
    q: '¿Qué pidió el hijo menor en la parábola del hijo pródigo?',
    opts: ['Un trabajo en la viña', 'Su herencia', 'Un puesto en el templo', 'El perdón de su hermano'],
    correct: 1,
    explain: 'El hijo menor pidió su parte de la herencia, se marchó lejos y la gastó; luego volvió arrepentido y el padre lo recibió con alegría (Lucas 15:11-32).'
  },
  {
    q: '¿Qué convirtió Jesús en las bodas de Caná?',
    opts: ['Agua en vino', 'Piedras en pan', 'Peces en panes', 'Aceite en perfume'],
    correct: 0,
    explain: 'En Caná, Jesús convirtió el agua en vino. Fue su primer signo según el evangelio de Juan (Juan 2:1-11).'
  },
  {
    q: '¿Qué día encontraron las mujeres el sepulcro vacío?',
    opts: ['El sábado por la noche', 'El primer día de la semana', 'Al tercer mes', 'El día de Pentecostés'],
    correct: 1,
    explain: 'Al amanecer del primer día de la semana, las mujeres fueron al sepulcro y lo encontraron vacío; un ángel les anunció la resurrección (Mateo 28:1-10).'
  },
  {
    q: '¿Cuántos evangelios hay en el Nuevo Testamento?',
    opts: ['Dos', 'Cuatro', 'Siete', 'Doce'],
    correct: 1,
    explain: 'El Nuevo Testamento tiene cuatro evangelios: Mateo, Marcos, Lucas y Juan.'
  },
  {
    q: '¿Qué significa el nombre Yeshúa (Jesús) en hebreo?',
    opts: ['Dios salva', 'Rey de reyes', 'Príncipe de paz', 'Luz del mundo'],
    correct: 0,
    explain: 'Yeshúa significa «Dios salva». El ángel anunció a José que el niño se llamaría Jesús porque salvaría a su pueblo (Mateo 1:21).'
  }
];

/* =================== MENSAJES BÍBLICOS DE BLOQUEO =================== */
DATA.bibleWarnings = {
  first: {
    title: 'Por favor, termina las respuestas',
    body: 'Aún te quedan preguntas por responder. El cuestionario debe completarse en su totalidad antes de continuar.',
    verse: '«Ninguno que pone su mano al arado y mira hacia atrás es apto para el reino de Dios.»',
    cite: 'Lucas 9:62'
  },
  second: {
    title: 'Por favor, vuelve al cuestionario',
    body: 'No puedes abandonar el cuestionario. Vuelve y termina todas las preguntas para poder continuar.',
    verse: '«Mira que vengo pronto; retén lo que tienes, para que ninguno tome tu corona.»',
    cite: 'Apocalipsis 3:11'
  }
};

/* =================== ETAPAS =================== */
const STAGES = [
  { tag:'Etapa 1', short:'Conociendo a Jesús', title:'Conociendo a Jesús', lead:'Quién fue, de dónde vino, cómo comenzó su ministerio y cuál fue su misión.' },
  { tag:'Etapa 2', short:'Enseñanzas', title:'Las enseñanzas de Jesús', lead:'Ocho claves que transforman la manera de entender a Dios, a los demás y a uno mismo.' },
  { tag:'Etapa 3', short:'Parábolas', title:'Las parábolas', lead:'Historias sencillas que abren una ventana al Reino de Dios. Toca cada una para leerla completa.' },
  { tag:'Etapa 4', short:'Milagros', title:'Los milagros de Jesús', lead:'Señales que revelan su compasión, su autoridad y el sentido de su misión.' },
  { tag:'Etapa 5', short:'Pasión y resurrección', title:'La pasión y la resurrección', lead:'El centro de la fe cristiana, narrado con sobriedad y respeto.' },
  { tag:'Etapa 6', short:'Nuevo Testamento', title:'El Nuevo Testamento', lead:'Los 27 libros que transmiten y explican el mensaje de Jesús. Selecciona uno para conocerlo.' }
];

/* =================== DOM =================== */
const els = {
  welcome:    $('#welcome'),
  experience: $('#experience'),
  transition: $('#transition'),
  knowledge:  $('#knowledge'),
  final:      $('#final'),
  stageBody:  $('#stageBody'),
  rail:       $('#rail'),
  bar:        $('#globalBar'),
  pct:        $('#globalPct'),
  themeBtn:   $('#themeBtn'),
  menuBtn:    $('#menuBtn'),
  resumeBox:  $('#resumeBox'),
  resumeTxt:  $('#resumeTxt'),
  modal:      $('#modal'),
  modalTag:   $('#modalTag'),
  modalTitle: $('#modalTitle'),
  modalBody:  $('#modalBody'),
  quizBody:   $('#quizBody'),
  quizBar:    $('#quizBar'),
  quizCount:  $('#quizCount'),
  quizResult: $('#quizResult'),
  lockModal:  $('#lockModal'),
  lockTag:    $('#lockTag'),
  lockTitle:  $('#lockTitle'),
  lockBody:   $('#lockBody'),
  lockContinue: $('#lockContinue')
};

/* =================== TEMA =================== */
function applyTheme(){
  document.documentElement.setAttribute('data-theme', state.theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute('content', state.theme === 'dark' ? '#0f0d0b' : '#f6f0e4');
}
els.themeBtn.addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
  saveState();
});

/* =================== PANTALLAS =================== */
function showScreen(name){
  state.screen = name;
  els.welcome.hidden    = name !== 'welcome';
  els.experience.hidden = name !== 'experience';
  els.transition.hidden = name !== 'transition';
  els.knowledge.hidden  = name !== 'knowledge';
  els.final.hidden      = name !== 'final';

  els.rail.hidden = name !== 'experience';
  els.menuBtn.hidden = name !== 'experience';

  saveState();
  updateProgress();
}
function scrollTopInstant(){ window.scrollTo(0, 0); }

function updateProgress(){
  let pct = 0;
  if(state.screen === 'experience') pct = ((state.stage + 1) / (STAGES.length + 1)) * 100;
  if(state.screen === 'transition') pct = (STAGES.length / (STAGES.length + 1)) * 100;
  if(state.screen === 'knowledge'){
    const answered = Object.keys(state.quizAnswers).length;
    pct = ((STAGES.length + answered / DATA.quiz.length) / (STAGES.length + 1)) * 100;
  }
  if(state.screen === 'final') pct = 100;
  if(state.screen === 'welcome' && state.started) pct = (state.stage / (STAGES.length + 1)) * 100;
  els.bar.style.right = (100 - pct) + '%';
  els.pct.textContent = Math.round(pct) + '%';
}

/* =================== HISTORY (bloqueo) =================== */
let historyLocked = false;

function enterKnowledgeHistory(){
  historyLocked = true;
  try { history.pushState({ screen: 'knowledge', locked: true }, '', '#conocimiento'); } catch(e){}
}
function releaseKnowledgeHistory(){
  historyLocked = false;
  try { history.replaceState({ screen: 'final' }, '', '#reflexion'); } catch(e){}
}

window.addEventListener('popstate', () => {
  if(historyLocked && state.screen === 'knowledge' && !state.quizCompleted){
    try { history.pushState({ screen: 'knowledge', locked: true }, '', '#conocimiento'); } catch(e){}
    state.lockAttempts = (state.lockAttempts || 0) + 1;
    saveState();
    showLockModal();
  }
});

function showLockModal(){
  const msg = state.lockAttempts >= 2 ? DATA.bibleWarnings.second : DATA.bibleWarnings.first;
  els.lockTag.textContent = state.lockAttempts >= 2 ? 'Por favor, vuelve' : 'Un momento';
  els.lockTitle.textContent = msg.title;
  els.lockBody.innerHTML = `
    <p>${msg.body}</p>
    <blockquote class="verse" style="margin-top:18px">
      <p>${msg.verse}</p>
      <cite>${msg.cite}</cite>
    </blockquote>`;
  els.lockModal.classList.add('open');
  els.lockModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeLockModal(){
  els.lockModal.classList.remove('open');
  els.lockModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
els.lockContinue.addEventListener('click', closeLockModal);

/* =================== RIEL =================== */
function buildRail(){
  els.rail.innerHTML = STAGES.map((s, i) => `
    <button class="rail__item" data-stage="${i}" aria-current="${i === state.stage}">
      <span class="rail__dot" aria-hidden="true"></span>
      <span class="rail__label">${i + 1} · ${s.short}</span>
    </button>`).join('');

  $$('.rail__item', els.rail).forEach(btn => {
    btn.addEventListener('click', () => {
      state.stage = Number(btn.dataset.stage);
      renderStage();
    });
  });
}
function syncRail(){
  $$('.rail__item', els.rail).forEach((btn, i) => {
    btn.setAttribute('aria-current', i === state.stage);
    btn.classList.toggle('done', i < state.stage);
  });
}

/* =================== COMPONENTES =================== */
function stageHead(i){
  const s = STAGES[i];
  return `<header class="stage-head"><span class="stage-tag">${s.tag}</span><h2>${s.title}</h2><p class="lead">${s.lead}</p></header>`;
}
function stageNav(i){
  const last = i === STAGES.length - 1;
  return `<div class="stagenav">
    <button class="btn btn--ghost" data-nav="prev" ${i === 0 ? 'disabled' : ''}>← Anterior</button>
    <button class="btn btn--primary" data-nav="next">${last ? 'Ir a la reflexión →' : 'Siguiente →'}</button>
  </div>`;
}
const verseBlock = (ref, text) => `<blockquote class="verse"><p>«${text}»</p><cite>${ref}</cite></blockquote>`;
const iconFor = {
  art: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5V6a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H19"/></svg>`,
  miracle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/><circle cx="12" cy="12" r="4"/></svg>`
};

/* =================== RENDER ETAPAS =================== */
const RENDER = {};

RENDER[0] = () => `
  ${stageHead(0)}
  <div class="cards cards--facts">
    ${DATA.intro.map(c => `<article class="fact"><span class="fact__num">${c.n}</span><h3>${c.title}</h3><p>${c.text}</p></article>`).join('')}
  </div>
  <h3 class="subhead">Línea de tiempo interactiva</h3>
  <p class="hint">Toca cada momento para leer su referencia bíblica.</p>
  <div class="timeline" id="timeline">
    ${DATA.timeline.map((t, i) => `<button class="tl" data-i="${i}" aria-current="${i === 0}"><span class="tl__dot" aria-hidden="true"></span><span class="tl__when">${t.when}</span><span class="tl__title">${t.title}</span></button>`).join('')}
  </div>
  <div class="tl-detail" id="tlDetail"></div>
  ${stageNav(0)}`;

RENDER[1] = () => `
  ${stageHead(1)}
  <div class="grid">
    ${DATA.teachings.map((t, i) => `<button class="card" data-teach="${i}"><div class="card__art">${iconFor.art}</div><div class="card__body"><span class="card__kicker">${t.kicker}</span><h3 class="card__title">${t.title}</h3><p class="card__text">${t.explain.slice(0, 92)}…</p><span class="card__more">Leer</span></div></button>`).join('')}
  </div>
  ${stageNav(1)}`;

RENDER[2] = () => `
  ${stageHead(2)}
  <div class="grid">
    ${DATA.parables.map((p, i) => `<button class="card" data-parable="${i}"><div class="card__art">${iconFor.art}</div><div class="card__body"><span class="card__kicker">${p.ref}</span><h3 class="card__title">${p.title}</h3><p class="card__text">${p.summary}</p><span class="card__more">Abrir parábola</span></div></button>`).join('')}
  </div>
  ${stageNav(2)}`;

RENDER[3] = () => `
  ${stageHead(3)}
  <div class="grid">
    ${DATA.miracles.map((m, i) => `<button class="card" data-miracle="${i}"><div class="card__art">${iconFor.miracle}</div><div class="card__body"><span class="card__kicker">${m.ref}</span><h3 class="card__title">${m.title}</h3><p class="card__text">${m.summary}</p><span class="card__more">Ver relato</span></div></button>`).join('')}
  </div>
  ${stageNav(3)}`;

RENDER[4] = () => `
  ${stageHead(4)}
  <div class="passion">
    ${DATA.passion.map((p, i) => `<div class="pstep" data-pstep="${i}"><button class="pstep__head" aria-expanded="false"><span class="pstep__n">${String(i + 1).padStart(2, '0')}</span><span class="pstep__t">${p.title}</span><span class="pstep__x" aria-hidden="true">+</span></button><div class="pstep__body"><div class="pstep__inner"><div><p>${p.text}</p><p style="display:block;margin-top:12px;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:var(--gold)">${p.ref}</p></div></div></div></div>`).join('')}
  </div>
  ${stageNav(4)}`;

RENDER[5] = () => `
  ${stageHead(5)}
  <div class="filters" id="filters">
    ${DATA.bookCats.map(c => `<button class="chip" data-cat="${c.id}" aria-pressed="${c.id === 'all'}">${c.name}</button>`).join('')}
  </div>
  <div class="books" id="books"></div>
  ${stageNav(5)}`;

function renderStage(){
  try{
    els.stageBody.innerHTML = RENDER[state.stage]();
    syncRail();
    updateProgress();
    bindStage(state.stage);
    saveState();
    scrollTopInstant();
  }catch(err){ console.error('Error al renderizar la etapa:', err); }
}

function bindStage(i){
  $$('[data-nav]', els.stageBody).forEach(btn => {
    btn.addEventListener('click', () => {
      if(btn.dataset.nav === 'prev'){
        if(state.stage > 0){ state.stage--; renderStage(); }
      }else{
        if(state.stage < STAGES.length - 1){ state.stage++; renderStage(); }
        else openTransition();
      }
    });
  });
  if(i === 0) bindTimeline();
  if(i === 1) bindTeachings();
  if(i === 2) bindParables();
  if(i === 3) bindMiracles();
  if(i === 4) bindPassion();
  if(i === 5) bindBooks();
}

function bindTimeline(){
  const detail = $('#tlDetail');
  const items = $$('.tl', els.stageBody);
  if(!detail || !items.length) return;
  const paint = idx => {
    const t = DATA.timeline[idx];
    detail.innerHTML = `<h4>${t.title}</h4><p>${t.text}</p><span class="ref">${t.ref}</span>`;
    items.forEach(el => el.setAttribute('aria-current', Number(el.dataset.i) === idx));
  };
  items.forEach(el => el.addEventListener('click', () => paint(Number(el.dataset.i))));
  paint(0);
}
function bindTeachings(){
  $$('[data-teach]', els.stageBody).forEach(card => {
    card.addEventListener('click', () => {
      const t = DATA.teachings[Number(card.dataset.teach)];
      openModal('Enseñanza', t.title, `<h4>Texto bíblico</h4>${verseBlock(t.ref, t.verse)}<h4>Explicación</h4><p>${t.explain}</p><h4>Su significado</h4><p>${t.meaning}</p><h4>En la vida cotidiana</h4><p>${t.apply}</p>`);
    });
  });
}
function bindParables(){
  $$('[data-parable]', els.stageBody).forEach(card => {
    card.addEventListener('click', () => {
      const p = DATA.parables[Number(card.dataset.parable)];
      openModal('Parábola', p.title, `<h4>Narración</h4><p>${p.narration}</p><h4>Referencia</h4><p>${p.ref}</p><h4>Su enseñanza</h4><p>${p.teaching}</p>`);
    });
  });
}
function bindMiracles(){
  $$('[data-miracle]', els.stageBody).forEach(card => {
    card.addEventListener('click', () => {
      const m = DATA.miracles[Number(card.dataset.miracle)];
      openModal('Milagro', m.title, `<h4>Contexto</h4><p>${m.context}</p><h4>El relato</h4><p>${m.story}</p><h4>Referencia</h4><p>${m.ref}</p><h4>Significado espiritual</h4><p>${m.meaning}</p>`);
    });
  });
}
function bindPassion(){
  $$('.pstep', els.stageBody).forEach(step => {
    const head = $('.pstep__head', step);
    head.addEventListener('click', () => {
      const isOpen = step.classList.contains('open');
      $$('.pstep', els.stageBody).forEach(s => {
        s.classList.remove('open');
        $('.pstep__head', s).setAttribute('aria-expanded', 'false');
      });
      if(!isOpen){ step.classList.add('open'); head.setAttribute('aria-expanded', 'true'); }
    });
  });
  const first = $('.pstep', els.stageBody);
  if(first){ first.classList.add('open'); $('.pstep__head', first).setAttribute('aria-expanded', 'true'); }
}
function bindBooks(){
  const wrap = $('#books');
  const filters = $$('.chip', els.stageBody);
  if(!wrap) return;
  const paint = cat => {
    const list = cat === 'all' ? DATA.nt : DATA.nt.filter(b => b.c === cat);
    wrap.innerHTML = list.map(b => {
      const idx = DATA.nt.indexOf(b);
      return `<button class="book" data-book="${idx}"><span class="book__n">${b.n}</span><span class="book__c">${categoryName(b.c)}</span><span class="book__hint">${b.msg}</span></button>`;
    }).join('');
    $$('.book', wrap).forEach(btn => {
      btn.addEventListener('click', () => {
        const b = DATA.nt[Number(btn.dataset.book)];
        openModal(categoryName(b.c), b.n, `<h4>Autoría tradicional</h4><p>${b.a}</p><h4>Contexto</h4><p>${b.ctx}</p><h4>Contenido</h4><p>${b.cont}</p><h4>Mensaje principal</h4><p>${b.msg}</p>`);
      });
    });
  };
  filters.forEach(chip => {
    chip.addEventListener('click', () => {
      filters.forEach(c => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', 'true');
      paint(chip.dataset.cat);
    });
  });
  paint('all');
}
function categoryName(id){ const c = DATA.bookCats.find(x => x.id === id); return c ? c.name : ''; }

/* =================== MODAL GENÉRICO =================== */
function openModal(tag, title, html){
  els.modalTag.textContent = tag;
  els.modalTitle.textContent = title;
  els.modalBody.innerHTML = html;
  els.modal.classList.add('open');
  els.modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const btn = $('.modal__close', els.modal);
  if(btn) btn.focus();
}
function closeModal(){
  els.modal.classList.remove('open');
  els.modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
els.modal.addEventListener('click', e => {
  if(e.target.closest('[data-close]')) closeModal();
});
document.addEventListener('keydown', e => {
  if(e.key === 'Escape'){
    if(els.modal.classList.contains('open')) closeModal();
    if(els.lockModal.classList.contains('open')) { /* bloqueado: no cerrar */ }
  }
  if(state.screen === 'experience' && !els.modal.classList.contains('open') && !els.lockModal.classList.contains('open')){
    if(e.key === 'ArrowRight' && state.stage < STAGES.length - 1){ e.preventDefault(); state.stage++; renderStage(); }
    if(e.key === 'ArrowLeft' && state.stage > 0){ e.preventDefault(); state.stage--; renderStage(); }
  }
});

/* =================== TRANSICIÓN → CONOCIMIENTO =================== */
function openTransition(){
  showScreen('transition');
  scrollTopInstant();
}

$('#acceptQuizBtn').addEventListener('click', () => {
  state.lockAttempts = 0;
  saveState();
  openKnowledge();
});

$('#reviewQuizBtn').addEventListener('click', () => {
  state.stage = 0;
  buildRail();
  showScreen('experience');
  renderStage();
});

/* =================== CUESTIONARIO =================== */
function openKnowledge(){
  enterKnowledgeHistory();
  showScreen('knowledge');
  renderQuiz();
  scrollTopInstant();
}

function quizAnsweredCount(){
  return Object.keys(state.quizAnswers).length;
}

function renderQuiz(){
  const idx = quizAnsweredCount();
  if(idx >= DATA.quiz.length){
    showQuizComplete();
    return;
  }
  const q = DATA.quiz[idx];
  const letters = ['A','B','C','D'];
  els.quizCount.textContent = `${idx + 1} / ${DATA.quiz.length}`;
  const pct = (idx / DATA.quiz.length) * 100;
  els.quizBar.style.right = (100 - pct) + '%';

  els.quizBody.innerHTML = `
    <div class="quiz-q">
      <p class="quiz-q__num">Pregunta ${idx + 1}</p>
      <h3 class="quiz-q__text">${q.q}</h3>
      <div class="quiz-q__opts">
        ${q.opts.map((o, i) => `<button class="quiz-opt" data-opt="${i}"><span class="quiz-opt__let">${letters[i]}</span><span>${o}</span></button>`).join('')}
      </div>
      <div id="quizFeedback"></div>
    </div>`;

  $$('.quiz-opt', els.quizBody).forEach(btn => {
    btn.addEventListener('click', () => answerQuiz(idx, Number(btn.dataset.opt)));
  });
}

function answerQuiz(qIdx, optIdx){
  if(state.quizAnswers[qIdx] !== undefined) return;
  const q = DATA.quiz[qIdx];
  state.quizAnswers[qIdx] = optIdx;
  if(optIdx === q.correct) state.quizScore = (state.quizScore || 0) + 1;
  saveState();
  updateProgress();

  const opts = $$('.quiz-opt', els.quizBody);
  opts.forEach((btn, i) => {
    btn.disabled = true;
    if(i === q.correct) btn.classList.add('is-correct');
    else if(i === optIdx) btn.classList.add('is-wrong');
  });

  const fb = $('#quizFeedback');
  const ok = optIdx === q.correct;
  fb.innerHTML = `
    <div class="quiz-explain">
      <p style="margin:0 0 6px"><strong>${ok ? '¡Correcto!' : 'Respuesta correcta: ' + ['A','B','C','D'][q.correct]}</strong></p>
      <p style="margin:0">${q.explain}</p>
    </div>
    <div class="quiz-actions">
      <button class="btn btn--primary" id="quizNext">${qIdx + 1 === DATA.quiz.length ? 'Ver resultado →' : 'Siguiente pregunta →'}</button>
    </div>`;

  $('#quizNext').addEventListener('click', () => {
    if(quizAnsweredCount() >= DATA.quiz.length) showQuizComplete();
    else renderQuiz();
  });
}

function showQuizComplete(){
  state.quizCompleted = true;
  saveState();
  updateProgress();
  els.quizCount.textContent = `${DATA.quiz.length} / ${DATA.quiz.length}`;
  els.quizBar.style.right = '0%';

  const total = DATA.quiz.length;
  const score = state.quizScore || 0;
  els.quizBody.innerHTML = `
    <div class="quiz-q">
      <p class="quiz-q__num">Cuestionario completado</p>
      <h3 class="quiz-q__text">Has respondido las ${total} preguntas</h3>
      <p class="lead">Aciertos: <strong>${score} de ${total}</strong>. Tu resultado se mostrará en la pantalla de reflexión.</p>
      <div class="quiz-actions">
        <button class="btn btn--primary" id="quizFinish">Continuar a la reflexión →</button>
      </div>
    </div>`;
  $('#quizFinish').addEventListener('click', goToFinalFromQuiz);
}

function goToFinalFromQuiz(){
  releaseKnowledgeHistory();
  openFinal();
}

/* =================== REFLEXIÓN =================== */
function openFinal(){
  showScreen('final');
  paintReflections();
  paintQuizResult();
  scrollTopInstant();
}

function paintQuizResult(){
  if(state.quizCompleted && els.quizResult){
    const total = DATA.quiz.length;
    const score = state.quizScore || 0;
    const pct = Math.round((score / total) * 100);
    let msg = 'Sigue profundizando: cada paso cuenta.';
    if(pct >= 90) msg = '¡Excelente! Has comprendido muy bien el recorrido.';
    else if(pct >= 70) msg = '¡Muy bien! Tienes una base sólida.';
    else if(pct >= 50) msg = 'Buen comienzo. Repasa lo aprendido cuando quieras.';
    els.quizResult.innerHTML = `
      <p class="quiz-result__label">Tu resultado en el cuestionario</p>
      <p class="quiz-result__score">${score} / ${total}</p>
      <p class="quiz-result__msg">${msg}</p>`;
    els.quizResult.hidden = false;
  }else if(els.quizResult){
    els.quizResult.hidden = true;
  }
}

function paintReflections(){
  $$('textarea[data-q]').forEach(ta => {
    ta.value = state.reflections[ta.dataset.q] || '';
  });
}

function bindReflections(){
  let timer = null;
  $$('textarea[data-q]').forEach(ta => {
    ta.addEventListener('input', () => {
      state.reflections[ta.dataset.q] = ta.value;
      clearTimeout(timer);
      timer = setTimeout(() => {
        saveState();
        const note = $('#saveNote');
        if(note){
          note.textContent = 'Guardado ✓';
          setTimeout(() => { note.textContent = 'Guardado automáticamente en este dispositivo.'; }, 1600);
        }
      }, 400);
    });
  });
}

/* =================== BOTONES GLOBALES =================== */
$('#startBtn').addEventListener('click', () => {
  state.started = true;
  state.stage = 0;
  buildRail();
  showScreen('experience');
  renderStage();
});
$('#resumeBtn').addEventListener('click', () => {
  state.started = true;
  buildRail();
  if(state.quizCompleted && state.screen === 'final'){
    openFinal();
  }else if(state.quizCompleted){
    openFinal();
  }else if(state.screen === 'knowledge' || state.screen === 'transition'){
    openKnowledge();
  }else{
    showScreen('experience');
    renderStage();
  }
});
els.menuBtn.addEventListener('click', () => {
  els.rail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
$$('[data-goto]').forEach(btn => {
  btn.addEventListener('click', () => {
    state.stage = Number(btn.dataset.goto);
    buildRail();
    showScreen('experience');
    renderStage();
  });
});
$('#reviewBtn').addEventListener('click', () => {
  const box = $('#reflection');
  box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const first = $('textarea[data-q]', box);
  if(first) setTimeout(() => first.focus(), 450);
});
$('#restartBtn').addEventListener('click', () => {
  const ok = confirm('¿Reiniciar la experiencia? Se borrará el progreso y el cuestionario, pero no tus reflexiones escritas.');
  if(!ok) return;
  state.stage = 0;
  state.started = false;
  state.quizCompleted = false;
  state.quizAnswers = {};
  state.quizScore = 0;
  state.lockAttempts = 0;
  historyLocked = false;
  buildRail();
  showScreen('welcome');
  refreshResume();
  scrollTopInstant();
});

/* =================== REANUDAR =================== */
function refreshResume(){
  const hasProgress = state.started && (state.stage > 0 || state.screen !== 'welcome' || state.quizCompleted);
  els.resumeBox.hidden = !hasProgress;
  if(hasProgress){
    if(state.quizCompleted){
      els.resumeTxt.textContent = 'Ya completaste el recorrido. Puedes volver a la reflexión final.';
    }else if(state.screen === 'knowledge' || state.screen === 'transition'){
      els.resumeTxt.textContent = 'Tienes un cuestionario pendiente. Puedes retomarlo donde lo dejaste.';
    }else{
      const s = STAGES[Math.min(state.stage, STAGES.length - 1)];
      els.resumeTxt.textContent = `Tu recorrido quedó guardado en la etapa ${state.stage + 1}: «${s.title}».`;
    }
  }
}

/* =================== INIT =================== */
(function init(){
  const hadSaved = loadState();
  if(!hadSaved){
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    state.theme = prefersDark ? 'dark' : 'light';
  }
  applyTheme();
  buildRail();
  bindReflections();
  refreshResume();
  showScreen('welcome');
  paintReflections();
  paintQuizResult();
  window.addEventListener('beforeunload', saveState);
})();
