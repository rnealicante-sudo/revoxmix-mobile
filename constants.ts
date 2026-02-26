
import { RadioStation } from './types';

export const STATIONS: RadioStation[] = [
  {
    id: 'rne-radio1',
    name: 'Radio Nacional CV',
    url: 'https://rnelivestream.rtve.es/rne1/val/master.m3u8?idasset=3893537',
    bitrate: '128kbps',
    description: 'La radio de todos - RNE 1 Comunidad Valenciana',
    color: '#E30613',
    image: 'https://static.mytuner.mobi/media/tv-stations/p3r2q3nd826z.png',
    qualities: [
      { label: 'HQ', url: 'https://rnelivestream.rtve.es/rne1/val/master.m3u8?idasset=3893537', bitrate: '128kbps' },
      { label: 'LQ', url: 'https://rnelivestream.rtve.es/rne1/val/master.m3u8?idasset=3893537&quality=low', bitrate: '64kbps' }
    ]
  },
  {
    id: 'rne-clasica',
    name: 'Radio Clásica',
    url: 'https://rtvelivestream.rtve.es/rtvesec/rne/rne_r2_main.m3u8',
    bitrate: '192kbps',
    description: 'La mejor música clásica',
    color: '#E30613',
    image: 'https://cdn.webradio.io/station/radio-clasica/logo.png',
    qualities: [
      { label: 'HQ', url: 'https://rtvelivestream.rtve.es/rtvesec/rne/rne_r2_main.m3u8', bitrate: '192kbps' },
      { label: 'MQ', url: 'https://rtvelivestream.rtve.es/rtvesec/rne/rne_r2_main.m3u8', bitrate: '128kbps' }
    ]
  },
  {
    id: 'rne-radio3',
    name: 'Radio 3',
    url: 'https://rtvelivestream.rtve.es/rtvesec/rne/rne_r3_main.m3u8',
    bitrate: '192kbps',
    description: 'Cultura, música y creatividad',
    color: '#E30613',
    image: 'https://cdn.webradio.io/station/radio-3/logo.png',
    qualities: [
      { label: 'HQ', url: 'https://rtvelivestream.rtve.es/rtvesec/rne/rne_r3_main.m3u8', bitrate: '192kbps' },
      { label: 'LQ', url: 'https://rtvelivestream.rtve.es/rne_r3_main.m3u8?quality=low', bitrate: '96kbps' }
    ]
  },
  {
    id: 'rne-radio5-ali',
    name: 'Radio 5 Alicante',
    url: 'https://rnelivestream.rtve.es/rne5/ali/master.m3u8?idasset=6116423',
    bitrate: '128kbps',
    description: 'Información continua las 24h - Territorio Alicante',
    color: '#E30613',
    image: 'https://cdn.webradio.io/station/radio-5-todo-noticias/logo.png'
  },
  {
    id: 'ser-alicante',
    name: 'SER ALICANTE',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/SER_ALICANTEAAC.aac',
    bitrate: 'AAC',
    description: 'Cadena SER - Alicante',
    color: '#333399',
    image: 'https://static.mytuner.mobi/media/tv-stations/ser-logo.png'
  },
  {
    id: 'cope-alicante',
    name: 'COPE ALICANTE',
    url: 'https://alicante-copesedes-rrcast.flumotion.com/copesedes/alicante.mp3',
    bitrate: '128kbps',
    description: 'Cadena COPE - Alicante',
    color: '#333399',
    image: 'https://static.mytuner.mobi/media/tv-stations/cope-logo.png'
  },
  {
    id: 'ondacero-cv',
    name: 'ONDA CERO CV',
    url: 'https://atres-live.ondacero.es/live/delegaciones/oc/valenciaeventos/master.m3u8',
    bitrate: '128kbps',
    description: 'Onda Cero - Comunidad Valenciana',
    color: '#008e43',
    image: 'https://static.mytuner.mobi/media/tv-stations/onda-cero-logo.png'
  },
  {
    id: 'radio-marca',
    name: 'RADIO MARCA',
    url: 'http://relay.stream.enacast-cloud.com:8000/marcalinkdelegaciones256.mp3',
    bitrate: '256kbps',
    description: 'El deporte en directo',
    color: '#FF0000',
    image: 'https://static.mytuner.mobi/media/tv-stations/radio-marca.png'
  },
  {
    id: 'radio-espana',
    name: 'RADIO ESPAÑA',
    url: 'https://stream-151.zeno.fm/7ywx2u45vv8uv',
    bitrate: '128kbps',
    description: 'Emisora generalista española',
    color: '#FFD700',
    image: 'https://static.mytuner.mobi/media/tv-stations/radio-espana.png'
  },
  {
    id: 'intereconomia',
    name: 'RADIO INTERECONOMIA',
    url: 'https://streaming.intereconomia.com/siliconorg',
    bitrate: '128kbps',
    description: 'Información económica y financiera',
    color: '#004a99',
    image: 'https://intereconomia.com/wp-content/uploads/2016/10/logo-intereconomia.png'
  },
  {
    id: 'ser-alcoy',
    name: 'SER ALCOY',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/SER_ASO_ALCOYAAC.aac',
    bitrate: 'AAC',
    description: 'Cadena SER - Alcoy',
    color: '#333399',
    image: 'https://static.mytuner.mobi/media/tv-stations/ser-logo.png'
  },
  {
    id: 'ser-denia',
    name: 'SER DENIA',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/SER_ASO_DENIAAAC.aac',
    bitrate: 'AAC',
    description: 'Cadena SER - Denia',
    color: '#333399',
    image: 'https://static.mytuner.mobi/media/tv-stations/ser-logo.png'
  },
  {
    id: 'ser-elche',
    name: 'SER ELCHE',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/SER_ASO_ELCHE.mp3',
    bitrate: '128kbps',
    description: 'Cadena SER - Elche',
    color: '#333399',
    image: 'https://static.mytuner.mobi/media/tv-stations/ser-logo.png'
  },
  {
    id: 'ser-elda',
    name: 'SER ELDA',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/SER_ASO_ELDA.mp3',
    bitrate: '128kbps',
    description: 'Cadena SER - Elda',
    color: '#333399',
    image: 'https://static.mytuner.mobi/media/tv-stations/ser-logo.png'
  },
  {
    id: 'ser-mas-alicante',
    name: 'SER + ALICANTE',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/SER_MAS_ALICANTE.mp3',
    bitrate: '128kbps',
    description: 'Cadena SER Plus - Alicante',
    color: '#333399',
    image: 'https://static.mytuner.mobi/media/tv-stations/ser-logo.png'
  },
  {
    id: 'ser-mas-alcoy',
    name: 'SER + ALCOY',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/SER_MAS_ASO_ALCOY.mp3',
    bitrate: '128kbps',
    description: 'Cadena SER Plus - Alcoy',
    color: '#333399',
    image: 'https://static.mytuner.mobi/media/tv-stations/ser-logo.png'
  },
  {
    id: 'ser-villena',
    name: 'SER VILLENA',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/SER_VILLENA.mp3',
    bitrate: '128kbps',
    description: 'Cadena SER - Villena',
    color: '#333399',
    image: 'https://static.mytuner.mobi/media/tv-stations/ser-logo.png'
  },
  {
    id: 'umh-radio',
    name: 'UMH RADIO',
    url: 'https://laradioendirecto.umh.es/;',
    bitrate: '128kbps',
    description: 'Radio de la Universidad Miguel Hernández',
    color: '#990000',
    image: 'https://radio.umh.es/files/2014/05/Logo-UMH-Radio-300x300.png'
  },
  {
    id: 'flamenca-alicante',
    name: 'FLAMENCA ALICANTE',
    url: 'https://stream2.mediasector.es/laflamenca-alicante-DAB',
    bitrate: 'DAB',
    description: 'La mejor música flamenca en Alicante',
    color: '#FF4500',
    image: 'https://static.mytuner.mobi/media/tv-stations/la-flamenca.png'
  },
  {
    id: 'bikini-alicante',
    name: 'BIKINI ALICANTE',
    url: 'https://stream2.mediasector.es/bikini-alicante-BR384',
    bitrate: '384kbps',
    description: 'Música veraniega y éxitos en Alicante',
    color: '#00CED1',
    image: 'https://static.mytuner.mobi/media/tv-stations/bikini-fm.png'
  }
];
