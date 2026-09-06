import React, { useEffect, useRef, useState } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { MUNICIPIOS_GEO } from './municipios.geo';
import { NICARAGUA_GEO } from './nicaragua.geo';

const CITY_IMAGE_MODULES: Record<string, any> = {
  Chontales:  require('../../assets/images/ciudades/JUIGALPA.png'),
  Esteli:     require('../../assets/images/ciudades/ESTELI.png'),
  Granada:    require('../../assets/images/ciudades/GRANADA.png'),
  Leon:       require('../../assets/images/ciudades/LEON.png'),
  Managua:    require('../../assets/images/ciudades/MANAGUA.png'),
  Masaya:     require('../../assets/images/ciudades/MASAYA.png'),
  Matagalpa:  require('../../assets/images/ciudades/MATAGALPA.png'),
  RACCS:      require('../../assets/images/ciudades/BLUEFIELDS.png'),
  Bluefields: require('../../assets/images/ciudades/BLUEFIELDS.png'),
  'San Juan de Oriente': require('../../assets/images/ciudades/SAN-JUAN-DE-ORIENTE.png'),
  Nagarote:   require('../../assets/images/ciudades/NAGAROTE.jpeg'),
};

const NAGAROTE_TOUR_IMAGE_MODULES: Record<string, any[]> = {
  'cine-santiago': [
    require('../../assets/images/nagarote/thumbs/cine-santiago/t1.jpg'),
    require('../../assets/images/nagarote/thumbs/cine-santiago/t2.jpg'),
    require('../../assets/images/nagarote/thumbs/cine-santiago/t3.jpg'),
  ],
  'casa-de-cultura': [
    require('../../assets/images/nagarote/thumbs/casa-de-cultura/t1.jpg'),
    require('../../assets/images/nagarote/thumbs/casa-de-cultura/t2.jpg'),
  ],
  'mirador-la-concordia': [
    require('../../assets/images/nagarote/thumbs/mirador-la-concordia/t1.jpg'),
    require('../../assets/images/nagarote/thumbs/mirador-la-concordia/t2.jpg'),
    require('../../assets/images/nagarote/thumbs/mirador-la-concordia/t3.jpg'),
    require('../../assets/images/nagarote/thumbs/mirador-la-concordia/t4.jpg'),
    require('../../assets/images/nagarote/thumbs/mirador-la-concordia/t5.jpg'),
    require('../../assets/images/nagarote/thumbs/mirador-la-concordia/t6.jpg'),
  ],
  'parador-turistico-nagrandano': [
    require('../../assets/images/nagarote/thumbs/parador-turistico-nagrandano/t1.jpg'),
    require('../../assets/images/nagarote/thumbs/parador-turistico-nagrandano/t2.jpg'),
    require('../../assets/images/nagarote/thumbs/parador-turistico-nagrandano/t3.jpg'),
    require('../../assets/images/nagarote/thumbs/parador-turistico-nagrandano/t4.jpg'),
    require('../../assets/images/nagarote/thumbs/parador-turistico-nagrandano/t5.jpg'),
    require('../../assets/images/nagarote/thumbs/parador-turistico-nagrandano/t6.jpg'),
  ],
  'parque-central-nagarote': [
    require('../../assets/images/nagarote/thumbs/parque-central-nagarote/t1.jpg'),
    require('../../assets/images/nagarote/thumbs/parque-central-nagarote/t2.jpg'),
    require('../../assets/images/nagarote/thumbs/parque-central-nagarote/t3.jpg'),
    require('../../assets/images/nagarote/thumbs/parque-central-nagarote/t4.jpg'),
    require('../../assets/images/nagarote/thumbs/parque-central-nagarote/t5.jpg'),
    require('../../assets/images/nagarote/thumbs/parque-central-nagarote/t6.jpg'),
    require('../../assets/images/nagarote/thumbs/parque-central-nagarote/t7.jpg'),
    require('../../assets/images/nagarote/thumbs/parque-central-nagarote/t8.jpg'),
    require('../../assets/images/nagarote/thumbs/parque-central-nagarote/t9.jpg'),
  ],
  'parque-y-museo-el-xenizaro': [
    require('../../assets/images/nagarote/thumbs/parque-y-museo-el-xenizaro/t1.jpg'),
    require('../../assets/images/nagarote/thumbs/parque-y-museo-el-xenizaro/t2.jpg'),
    require('../../assets/images/nagarote/thumbs/parque-y-museo-el-xenizaro/t3.jpg'),
    require('../../assets/images/nagarote/thumbs/parque-y-museo-el-xenizaro/t4.jpg'),
  ],
};

const MANAGUA_TOUR_IMAGE_MODULES: Record<string, any[]> = {
  'casa-de-cultura-alejandro-cuadra': [
    require('../../assets/images/managua/thumbs/casa-de-cultura-alejandro-cuadra/t1.jpg'),
  ],
  'casa-de-cultura-camilo-zapata': [
    require('../../assets/images/managua/thumbs/casa-de-cultura-camilo-zapata/t1.jpg'),
    require('../../assets/images/managua/thumbs/casa-de-cultura-camilo-zapata/t2.jpg'),
  ],
  'casa-de-cultura-hugo-hernandez-oviedo': [
    require('../../assets/images/managua/thumbs/casa-de-cultura-hugo-hernandez-oviedo/t1.jpg'),
    require('../../assets/images/managua/thumbs/casa-de-cultura-hugo-hernandez-oviedo/t2.jpg'),
    require('../../assets/images/managua/thumbs/casa-de-cultura-hugo-hernandez-oviedo/t3.jpg'),
  ],
  'casa-de-cultura-otto-de-la-rocha': [
    require('../../assets/images/managua/thumbs/casa-de-cultura-otto-de-la-rocha/t1.jpg'),
  ],
  'casa-de-los-pueblos': [
    require('../../assets/images/managua/thumbs/casa-de-los-pueblos/t1.jpg'),
    require('../../assets/images/managua/thumbs/casa-de-los-pueblos/t2.jpg'),
  ],
  'casa-replica-museo-ruben-dario': [
    require('../../assets/images/managua/thumbs/casa-replica-museo-ruben-dario/t1.jpg'),
    require('../../assets/images/managua/thumbs/casa-replica-museo-ruben-dario/t2.jpg'),
    require('../../assets/images/managua/thumbs/casa-replica-museo-ruben-dario/t3.jpg'),
    require('../../assets/images/managua/thumbs/casa-replica-museo-ruben-dario/t4.jpg'),
    require('../../assets/images/managua/thumbs/casa-replica-museo-ruben-dario/t5.jpg'),
    require('../../assets/images/managua/thumbs/casa-replica-museo-ruben-dario/t6.jpg'),
    require('../../assets/images/managua/thumbs/casa-replica-museo-ruben-dario/t7.jpg'),
    require('../../assets/images/managua/thumbs/casa-replica-museo-ruben-dario/t8.jpg'),
    require('../../assets/images/managua/thumbs/casa-replica-museo-ruben-dario/t9.jpg'),
    require('../../assets/images/managua/thumbs/casa-replica-museo-ruben-dario/t10.jpg'),
    require('../../assets/images/managua/thumbs/casa-replica-museo-ruben-dario/t11.jpg'),
    require('../../assets/images/managua/thumbs/casa-replica-museo-ruben-dario/t12.jpg'),
    require('../../assets/images/managua/thumbs/casa-replica-museo-ruben-dario/t13.jpg'),
    require('../../assets/images/managua/thumbs/casa-replica-museo-ruben-dario/t14.jpg'),
  ],
  'casa-replica-san-jacinto': [
    require('../../assets/images/managua/thumbs/casa-replica-san-jacinto/t1.jpg'),
    require('../../assets/images/managua/thumbs/casa-replica-san-jacinto/t2.jpg'),
    require('../../assets/images/managua/thumbs/casa-replica-san-jacinto/t3.jpg'),
  ],
  'catedral-santiago-apostol': [
    require('../../assets/images/managua/thumbs/catedral-santiago-apostol/t1.jpg'),
    require('../../assets/images/managua/thumbs/catedral-santiago-apostol/t2.jpg'),
    require('../../assets/images/managua/thumbs/catedral-santiago-apostol/t3.jpg'),
    require('../../assets/images/managua/thumbs/catedral-santiago-apostol/t4.jpg'),
  ],
  'centro-cultural-colonia-dambach': [
    require('../../assets/images/managua/thumbs/centro-cultural-colonia-dambach/t1.jpg'),
    require('../../assets/images/managua/thumbs/centro-cultural-colonia-dambach/t2.jpg'),
  ],
  'centro-cultural-jose-coronel-urtecho': [
    require('../../assets/images/managua/thumbs/centro-cultural-jose-coronel-urtecho/t1.jpg'),
    require('../../assets/images/managua/thumbs/centro-cultural-jose-coronel-urtecho/t2.jpg'),
    require('../../assets/images/managua/thumbs/centro-cultural-jose-coronel-urtecho/t3.jpg'),
  ],
  'centro-cultural-tino-lopez-guerra': [
    require('../../assets/images/managua/thumbs/centro-cultural-tino-lopez-guerra/t1.jpg'),
    require('../../assets/images/managua/thumbs/centro-cultural-tino-lopez-guerra/t2.jpg'),
    require('../../assets/images/managua/thumbs/centro-cultural-tino-lopez-guerra/t3.jpg'),
  ],
  'centro-de-convenciones-olof-palme': [
    require('../../assets/images/managua/thumbs/centro-de-convenciones-olof-palme/t1.jpg'),
    require('../../assets/images/managua/thumbs/centro-de-convenciones-olof-palme/t2.jpg'),
  ],
  'centro-nacional-nieves-cajina': [
    require('../../assets/images/managua/thumbs/centro-nacional-nieves-cajina/t1.jpg'),
  ],
  'cinemateca-nacional': [
    require('../../assets/images/managua/thumbs/cinemateca-nacional/t1.jpg'),
    require('../../assets/images/managua/thumbs/cinemateca-nacional/t2.jpg'),
  ],
  'huellas-de-acahualinca': [
    require('../../assets/images/managua/thumbs/huellas-de-acahualinca/t1.jpg'),
  ],
  'kioscos-la-criolleria-y-la-chiveria': [
    require('../../assets/images/managua/thumbs/kioscos-la-criolleria-y-la-chiveria/t1.jpg'),
    require('../../assets/images/managua/thumbs/kioscos-la-criolleria-y-la-chiveria/t2.jpg'),
    require('../../assets/images/managua/thumbs/kioscos-la-criolleria-y-la-chiveria/t3.jpg'),
  ],
  'la-casona': [
    require('../../assets/images/managua/thumbs/la-casona/t1.jpg'),
    require('../../assets/images/managua/thumbs/la-casona/t2.jpg'),
    require('../../assets/images/managua/thumbs/la-casona/t3.jpg'),
    require('../../assets/images/managua/thumbs/la-casona/t4.jpg'),
  ],
  'la-chumila': [
    require('../../assets/images/managua/thumbs/la-chumila/t1.jpg'),
    require('../../assets/images/managua/thumbs/la-chumila/t2.jpg'),
    require('../../assets/images/managua/thumbs/la-chumila/t3.jpg'),
  ],
  'la-hormiga-de-oro': [
    require('../../assets/images/managua/thumbs/la-hormiga-de-oro/t1.jpg'),
    require('../../assets/images/managua/thumbs/la-hormiga-de-oro/t2.jpg'),
    require('../../assets/images/managua/thumbs/la-hormiga-de-oro/t3.jpg'),
  ],
  'la-refresqueria': [
    require('../../assets/images/managua/thumbs/la-refresqueria/t1.jpg'),
    require('../../assets/images/managua/thumbs/la-refresqueria/t2.jpg'),
  ],
  'las-cuatro-esquinas': [
    require('../../assets/images/managua/thumbs/las-cuatro-esquinas/t1.jpg'),
    require('../../assets/images/managua/thumbs/las-cuatro-esquinas/t2.jpg'),
    require('../../assets/images/managua/thumbs/las-cuatro-esquinas/t3.jpg'),
  ],
  'maquetas-vieja-managua': [
    require('../../assets/images/managua/thumbs/maquetas-vieja-managua/t1.jpg'),
    require('../../assets/images/managua/thumbs/maquetas-vieja-managua/t2.jpg'),
    require('../../assets/images/managua/thumbs/maquetas-vieja-managua/t3.jpg'),
    require('../../assets/images/managua/thumbs/maquetas-vieja-managua/t4.jpg'),
    require('../../assets/images/managua/thumbs/maquetas-vieja-managua/t5.jpg'),
    require('../../assets/images/managua/thumbs/maquetas-vieja-managua/t6.jpg'),
    require('../../assets/images/managua/thumbs/maquetas-vieja-managua/t7.jpg'),
  ],
  'mirador-loma-de-tiscapa': [
    require('../../assets/images/managua/thumbs/mirador-loma-de-tiscapa/t1.jpg'),
    require('../../assets/images/managua/thumbs/mirador-loma-de-tiscapa/t2.jpg'),
    require('../../assets/images/managua/thumbs/mirador-loma-de-tiscapa/t3.jpg'),
    require('../../assets/images/managua/thumbs/mirador-loma-de-tiscapa/t4.jpg'),
    require('../../assets/images/managua/thumbs/mirador-loma-de-tiscapa/t5.jpg'),
    require('../../assets/images/managua/thumbs/mirador-loma-de-tiscapa/t6.jpg'),
    require('../../assets/images/managua/thumbs/mirador-loma-de-tiscapa/t7.jpg'),
    require('../../assets/images/managua/thumbs/mirador-loma-de-tiscapa/t8.jpg'),
    require('../../assets/images/managua/thumbs/mirador-loma-de-tiscapa/t9.jpg'),
    require('../../assets/images/managua/thumbs/mirador-loma-de-tiscapa/t10.jpg'),
  ],
  'museo-leonel-rugama': [
    require('../../assets/images/managua/thumbs/museo-leonel-rugama/t1.jpg'),
    require('../../assets/images/managua/thumbs/museo-leonel-rugama/t2.jpg'),
  ],
  'museo-lolita-soriano': [
    require('../../assets/images/managua/thumbs/museo-lolita-soriano/t1.jpg'),
    require('../../assets/images/managua/thumbs/museo-lolita-soriano/t2.jpg'),
    require('../../assets/images/managua/thumbs/museo-lolita-soriano/t3.jpg'),
    require('../../assets/images/managua/thumbs/museo-lolita-soriano/t4.jpg'),
    require('../../assets/images/managua/thumbs/museo-lolita-soriano/t5.jpg'),
  ],
  'palacio-nacional-cultura': [
    require('../../assets/images/managua/thumbs/palacio-nacional-cultura/t1.jpg'),
    require('../../assets/images/managua/thumbs/palacio-nacional-cultura/t2.jpg'),
    require('../../assets/images/managua/thumbs/palacio-nacional-cultura/t3.jpg'),
    require('../../assets/images/managua/thumbs/palacio-nacional-cultura/t4.jpg'),
    require('../../assets/images/managua/thumbs/palacio-nacional-cultura/t5.jpg'),
  ],
  'parque-central': [
    require('../../assets/images/managua/thumbs/parque-central/t1.jpg'),
    require('../../assets/images/managua/thumbs/parque-central/t2.jpg'),
    require('../../assets/images/managua/thumbs/parque-central/t3.jpg'),
    require('../../assets/images/managua/thumbs/parque-central/t4.jpg'),
    require('../../assets/images/managua/thumbs/parque-central/t5.jpg'),
  ],
  'parque-heroes-dignidad': [
    require('../../assets/images/managua/thumbs/parque-heroes-dignidad/t1.jpg'),
    require('../../assets/images/managua/thumbs/parque-heroes-dignidad/t2.jpg'),
    require('../../assets/images/managua/thumbs/parque-heroes-dignidad/t3.jpg'),
  ],
  'plaza-de-la-revolucion': [
    require('../../assets/images/managua/thumbs/plaza-de-la-revolucion/t1.jpg'),
    require('../../assets/images/managua/thumbs/plaza-de-la-revolucion/t2.jpg'),
  ],
  'plaza-soberania': [
    require('../../assets/images/managua/thumbs/plaza-soberania/t1.jpg'),
    require('../../assets/images/managua/thumbs/plaza-soberania/t2.jpg'),
    require('../../assets/images/managua/thumbs/plaza-soberania/t3.jpg'),
  ],
  'teatro-nacional-ruben-dario': [
    require('../../assets/images/managua/thumbs/teatro-nacional-ruben-dario/t1.jpg'),
    require('../../assets/images/managua/thumbs/teatro-nacional-ruben-dario/t2.jpg'),
    require('../../assets/images/managua/thumbs/teatro-nacional-ruben-dario/t3.jpg'),
  ],
  'tiangue-hugo-chavez': [
    require('../../assets/images/managua/thumbs/tiangue-hugo-chavez/t1.jpg'),
    require('../../assets/images/managua/thumbs/tiangue-hugo-chavez/t2.jpg'),
    require('../../assets/images/managua/thumbs/tiangue-hugo-chavez/t3.jpg'),
  ],
  'tiangue-la-purisima': [
    require('../../assets/images/managua/thumbs/tiangue-la-purisima/t1.jpg'),
  ],
  'comidas-criollas': [
    require('../../assets/images/managua/thumbs/comidas-criollas/t1.jpg'),
  ],
  'tiangue-la-fe': [
    require('../../assets/images/managua/thumbs/tiangue-la-fe/t1.jpg'),
  ],
  'puerto-salvador-allende': [
    require('../../assets/images/managua/thumbs/puerto-salvador-allende/t1.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende/t2.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende/t3.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende/t4.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende/t5.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende/t6.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende/t7.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende/t8.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende/t9.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende/t10.jpg'),
  ],
  'paseo-de-los-estudiantes-natural': [
    require('../../assets/images/managua/thumbs/paseo-de-los-estudiantes-natural/t1.jpg'),
    require('../../assets/images/managua/thumbs/paseo-de-los-estudiantes-natural/t2.jpg'),
  ],
  'puerto-salvador-allende-natural': [
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-natural/t1.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-natural/t2.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-natural/t3.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-natural/t4.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-natural/t5.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-natural/t6.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-natural/t7.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-natural/t8.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-natural/t9.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-natural/t10.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-natural/t11.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-natural/t12.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-natural/t13.jpg'),
  ],
  'parque-luis-alfonso-velasquez-flores': [
    require('../../assets/images/managua/thumbs/parque-luis-alfonso-velasquez-flores/t1.jpg'),
    require('../../assets/images/managua/thumbs/parque-luis-alfonso-velasquez-flores/t2.jpg'),
    require('../../assets/images/managua/thumbs/parque-luis-alfonso-velasquez-flores/t3.jpg'),
    require('../../assets/images/managua/thumbs/parque-luis-alfonso-velasquez-flores/t4.jpg'),
    require('../../assets/images/managua/thumbs/parque-luis-alfonso-velasquez-flores/t5.jpg'),
  ],
  'paseo-de-los-estudiantes-recreativa': [
    require('../../assets/images/managua/thumbs/paseo-de-los-estudiantes-recreativa/t1.jpg'),
    require('../../assets/images/managua/thumbs/paseo-de-los-estudiantes-recreativa/t2.jpg'),
    require('../../assets/images/managua/thumbs/paseo-de-los-estudiantes-recreativa/t3.jpg'),
  ],
  'puerto-salvador-allende-recreativa': [
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-recreativa/t1.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-recreativa/t2.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-recreativa/t3.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-recreativa/t4.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-recreativa/t5.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-recreativa/t6.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-recreativa/t7.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-recreativa/t8.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-recreativa/t9.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-recreativa/t10.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-recreativa/t11.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-recreativa/t12.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-recreativa/t13.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-recreativa/t14.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-recreativa/t15.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-recreativa/t16.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-recreativa/t17.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-recreativa/t18.jpg'),
    require('../../assets/images/managua/thumbs/puerto-salvador-allende-recreativa/t19.jpg'),
  ],
};

const LEON_TOUR_IMAGE_MODULES: Record<string, any[]> = {
  'centro-cultural-ruben-dario': [
    require('../../assets/images/leon/thumbs/centro-cultural-ruben-dario/t1.jpg'),
    require('../../assets/images/leon/thumbs/centro-cultural-ruben-dario/t2.jpg'),
    require('../../assets/images/leon/thumbs/centro-cultural-ruben-dario/t3.jpg'),
    require('../../assets/images/leon/thumbs/centro-cultural-ruben-dario/t4.jpg'),
  ],
  'escuela-de-bellas-artes-mariana-sanson-arguello': [
    require('../../assets/images/leon/thumbs/escuela-de-bellas-artes-mariana-sanson-arguello/t1.jpg'),
    require('../../assets/images/leon/thumbs/escuela-de-bellas-artes-mariana-sanson-arguello/t2.jpg'),
  ],
  'monumento-los-motivos-del-lobo': [
    require('../../assets/images/leon/thumbs/monumento-los-motivos-del-lobo/t1.jpg'),
    require('../../assets/images/leon/thumbs/monumento-los-motivos-del-lobo/t2.jpg'),
    require('../../assets/images/leon/thumbs/monumento-los-motivos-del-lobo/t3.jpg'),
    require('../../assets/images/leon/thumbs/monumento-los-motivos-del-lobo/t4.jpg'),
    require('../../assets/images/leon/thumbs/monumento-los-motivos-del-lobo/t5.jpg'),
  ],
  'museo-ruben-dario': [
    require('../../assets/images/leon/thumbs/museo-ruben-dario/t1.jpg'),
    require('../../assets/images/leon/thumbs/museo-ruben-dario/t2.jpg'),
    require('../../assets/images/leon/thumbs/museo-ruben-dario/t3.jpg'),
    require('../../assets/images/leon/thumbs/museo-ruben-dario/t4.jpg'),
    require('../../assets/images/leon/thumbs/museo-ruben-dario/t5.jpg'),
    require('../../assets/images/leon/thumbs/museo-ruben-dario/t6.jpg'),
    require('../../assets/images/leon/thumbs/museo-ruben-dario/t7.jpg'),
    require('../../assets/images/leon/thumbs/museo-ruben-dario/t8.jpg'),
    require('../../assets/images/leon/thumbs/museo-ruben-dario/t9.jpg'),
    require('../../assets/images/leon/thumbs/museo-ruben-dario/t10.jpg'),
    require('../../assets/images/leon/thumbs/museo-ruben-dario/t11.jpg'),
  ],
  'parque-de-los-poetas': [
    require('../../assets/images/leon/thumbs/parque-de-los-poetas/t1.jpg'),
    require('../../assets/images/leon/thumbs/parque-de-los-poetas/t2.jpg'),
    require('../../assets/images/leon/thumbs/parque-de-los-poetas/t3.jpg'),
    require('../../assets/images/leon/thumbs/parque-de-los-poetas/t4.jpg'),
    require('../../assets/images/leon/thumbs/parque-de-los-poetas/t5.jpg'),
    require('../../assets/images/leon/thumbs/parque-de-los-poetas/t6.jpg'),
    require('../../assets/images/leon/thumbs/parque-de-los-poetas/t7.jpg'),
    require('../../assets/images/leon/thumbs/parque-de-los-poetas/t8.jpg'),
    require('../../assets/images/leon/thumbs/parque-de-los-poetas/t9.jpg'),
    require('../../assets/images/leon/thumbs/parque-de-los-poetas/t10.jpg'),
  ],
  'parque-ruben-dario': [
    require('../../assets/images/leon/thumbs/parque-ruben-dario/t1.jpg'),
    require('../../assets/images/leon/thumbs/parque-ruben-dario/t2.jpg'),
    require('../../assets/images/leon/thumbs/parque-ruben-dario/t3.jpg'),
    require('../../assets/images/leon/thumbs/parque-ruben-dario/t4.jpg'),
  ],
  'paseo-de-los-leones': [
    require('../../assets/images/leon/thumbs/paseo-de-los-leones/t1.jpg'),
    require('../../assets/images/leon/thumbs/paseo-de-los-leones/t2.jpg'),
    require('../../assets/images/leon/thumbs/paseo-de-los-leones/t3.jpg'),
  ],
  'real-insigne-basilica-de-la-asuncion': [
    require('../../assets/images/leon/thumbs/real-insigne-basilica-de-la-asuncion/t1.jpg'),
    require('../../assets/images/leon/thumbs/real-insigne-basilica-de-la-asuncion/t2.jpg'),
    require('../../assets/images/leon/thumbs/real-insigne-basilica-de-la-asuncion/t3.jpg'),
    require('../../assets/images/leon/thumbs/real-insigne-basilica-de-la-asuncion/t4.jpg'),
    require('../../assets/images/leon/thumbs/real-insigne-basilica-de-la-asuncion/t5.jpg'),
    require('../../assets/images/leon/thumbs/real-insigne-basilica-de-la-asuncion/t6.jpg'),
    require('../../assets/images/leon/thumbs/real-insigne-basilica-de-la-asuncion/t7.jpg'),
    require('../../assets/images/leon/thumbs/real-insigne-basilica-de-la-asuncion/t8.jpg'),
    require('../../assets/images/leon/thumbs/real-insigne-basilica-de-la-asuncion/t9.jpg'),
  ],
  'teatro-municipal-jose-de-la-cruz-mena': [
    require('../../assets/images/leon/thumbs/teatro-municipal-jose-de-la-cruz-mena/t1.jpg'),
    require('../../assets/images/leon/thumbs/teatro-municipal-jose-de-la-cruz-mena/t2.jpg'),
    require('../../assets/images/leon/thumbs/teatro-municipal-jose-de-la-cruz-mena/t3.jpg'),
  ],
  'unan-leon': [
    require('../../assets/images/leon/thumbs/unan-leon/t1.jpg'),
    require('../../assets/images/leon/thumbs/unan-leon/t2.jpg'),
    require('../../assets/images/leon/thumbs/unan-leon/t3.jpg'),
  ],
};

const JUIGALPA_TOUR_IMAGE_MODULES: Record<string, any[]> = {
  'casa-de-la-cultura-y-creatividad-gregorio-aguilar-barea': [
    require('../../assets/images/juigalpa/thumbs/casa-de-la-cultura-y-creatividad-gregorio-aguilar-barea/t1.jpg'),
    require('../../assets/images/juigalpa/thumbs/casa-de-la-cultura-y-creatividad-gregorio-aguilar-barea/t2.jpg'),
    require('../../assets/images/juigalpa/thumbs/casa-de-la-cultura-y-creatividad-gregorio-aguilar-barea/t3.jpg'),
    require('../../assets/images/juigalpa/thumbs/casa-de-la-cultura-y-creatividad-gregorio-aguilar-barea/t4.jpg'),
    require('../../assets/images/juigalpa/thumbs/casa-de-la-cultura-y-creatividad-gregorio-aguilar-barea/t5.jpg'),
  ],
  'casa-de-la-insigne-josefa-toledo-de-aguerri': [
    require('../../assets/images/juigalpa/thumbs/casa-de-la-insigne-josefa-toledo-de-aguerri/t1.jpg'),
    require('../../assets/images/juigalpa/thumbs/casa-de-la-insigne-josefa-toledo-de-aguerri/t2.jpg'),
    require('../../assets/images/juigalpa/thumbs/casa-de-la-insigne-josefa-toledo-de-aguerri/t3.jpg'),
    require('../../assets/images/juigalpa/thumbs/casa-de-la-insigne-josefa-toledo-de-aguerri/t4.jpg'),
  ],
  'mirador-palo-soto': [
    require('../../assets/images/juigalpa/thumbs/mirador-palo-soto/t1.jpg'),
    require('../../assets/images/juigalpa/thumbs/mirador-palo-soto/t2.jpg'),
    require('../../assets/images/juigalpa/thumbs/mirador-palo-soto/t3.jpg'),
  ],
  'mirador-sandino': [
    require('../../assets/images/juigalpa/thumbs/mirador-sandino/t1.jpg'),
    require('../../assets/images/juigalpa/thumbs/mirador-sandino/t2.jpg'),
    require('../../assets/images/juigalpa/thumbs/mirador-sandino/t3.jpg'),
    require('../../assets/images/juigalpa/thumbs/mirador-sandino/t4.jpg'),
  ],
  'museo-arqueologico-gregorio-aguilar-barea': [
    require('../../assets/images/juigalpa/thumbs/museo-arqueologico-gregorio-aguilar-barea/t1.jpg'),
    require('../../assets/images/juigalpa/thumbs/museo-arqueologico-gregorio-aguilar-barea/t2.jpg'),
    require('../../assets/images/juigalpa/thumbs/museo-arqueologico-gregorio-aguilar-barea/t3.jpg'),
    require('../../assets/images/juigalpa/thumbs/museo-arqueologico-gregorio-aguilar-barea/t4.jpg'),
    require('../../assets/images/juigalpa/thumbs/museo-arqueologico-gregorio-aguilar-barea/t5.jpg'),
    require('../../assets/images/juigalpa/thumbs/museo-arqueologico-gregorio-aguilar-barea/t6.jpg'),
  ],
  'parque-central-josefa-toledo-de-aguerri': [
    require('../../assets/images/juigalpa/thumbs/parque-central-josefa-toledo-de-aguerri/t1.jpg'),
    require('../../assets/images/juigalpa/thumbs/parque-central-josefa-toledo-de-aguerri/t2.jpg'),
    require('../../assets/images/juigalpa/thumbs/parque-central-josefa-toledo-de-aguerri/t3.jpg'),
    require('../../assets/images/juigalpa/thumbs/parque-central-josefa-toledo-de-aguerri/t4.jpg'),
    require('../../assets/images/juigalpa/thumbs/parque-central-josefa-toledo-de-aguerri/t5.jpg'),
    require('../../assets/images/juigalpa/thumbs/parque-central-josefa-toledo-de-aguerri/t6.jpg'),
  ],
  'parque-de-la-ninez': [
    require('../../assets/images/juigalpa/thumbs/parque-de-la-ninez/t1.jpg'),
    require('../../assets/images/juigalpa/thumbs/parque-de-la-ninez/t2.jpg'),
    require('../../assets/images/juigalpa/thumbs/parque-de-la-ninez/t3.jpg'),
    require('../../assets/images/juigalpa/thumbs/parque-de-la-ninez/t4.jpg'),
  ],
  'parque-ruben-dario': [
    require('../../assets/images/juigalpa/thumbs/parque-ruben-dario/t1.jpg'),
    require('../../assets/images/juigalpa/thumbs/parque-ruben-dario/t2.jpg'),
    require('../../assets/images/juigalpa/thumbs/parque-ruben-dario/t3.jpg'),
  ],
  'zoologico-thomas-belt': [
    require('../../assets/images/juigalpa/thumbs/zoologico-thomas-belt/t1.jpg'),
    require('../../assets/images/juigalpa/thumbs/zoologico-thomas-belt/t2.jpg'),
    require('../../assets/images/juigalpa/thumbs/zoologico-thomas-belt/t3.jpg'),
    require('../../assets/images/juigalpa/thumbs/zoologico-thomas-belt/t4.jpg'),
    require('../../assets/images/juigalpa/thumbs/zoologico-thomas-belt/t5.jpg'),
    require('../../assets/images/juigalpa/thumbs/zoologico-thomas-belt/t6.jpg'),
  ],
};

const GRANADA_TOUR_IMAGE_MODULES: Record<string, any[]> = {
  'antigua-fortaleza-la-polvora': [
    require('../../assets/images/granada/thumbs/antigua-fortaleza-la-polvora/t1.jpg'),
    require('../../assets/images/granada/thumbs/antigua-fortaleza-la-polvora/t2.jpg'),
    require('../../assets/images/granada/thumbs/antigua-fortaleza-la-polvora/t3.jpg'),
  ],
  'capilla-maria-auxiliadora': [
    require('../../assets/images/granada/thumbs/capilla-maria-auxiliadora/t1.jpg'),
    require('../../assets/images/granada/thumbs/capilla-maria-auxiliadora/t2.jpg'),
    require('../../assets/images/granada/thumbs/capilla-maria-auxiliadora/t3.jpg'),
  ],
  'cementerio-municipal-de-granada': [
    require('../../assets/images/granada/thumbs/cementerio-municipal-de-granada/t1.jpg'),
    require('../../assets/images/granada/thumbs/cementerio-municipal-de-granada/t2.jpg'),
    require('../../assets/images/granada/thumbs/cementerio-municipal-de-granada/t3.jpg'),
    require('../../assets/images/granada/thumbs/cementerio-municipal-de-granada/t4.jpg'),
  ],
  'centro-social-tio-san-antonio': [
    require('../../assets/images/granada/thumbs/centro-social-tio-san-antonio/t1.jpg'),
    require('../../assets/images/granada/thumbs/centro-social-tio-san-antonio/t2.jpg'),
    require('../../assets/images/granada/thumbs/centro-social-tio-san-antonio/t3.jpg'),
  ],
  'iglesia-la-merced': [
    require('../../assets/images/granada/thumbs/iglesia-la-merced/t1.jpg'),
    require('../../assets/images/granada/thumbs/iglesia-la-merced/t2.jpg'),
    require('../../assets/images/granada/thumbs/iglesia-la-merced/t3.jpg'),
    require('../../assets/images/granada/thumbs/iglesia-la-merced/t4.jpg'),
  ],
  'mercado-municipal': [
    require('../../assets/images/granada/thumbs/mercado-municipal/t1.jpg'),
    require('../../assets/images/granada/thumbs/mercado-municipal/t2.jpg'),
  ],
  'museo-del-chocolate': [
    require('../../assets/images/granada/thumbs/museo-del-chocolate/t1.jpg'),
    require('../../assets/images/granada/thumbs/museo-del-chocolate/t2.jpg'),
    require('../../assets/images/granada/thumbs/museo-del-chocolate/t3.jpg'),
  ],
  'palacio-de-cultura-jorge-navas-cordonero': [
    require('../../assets/images/granada/thumbs/palacio-de-cultura-jorge-navas-cordonero/t1.jpg'),
    require('../../assets/images/granada/thumbs/palacio-de-cultura-jorge-navas-cordonero/t2.jpg'),
    require('../../assets/images/granada/thumbs/palacio-de-cultura-jorge-navas-cordonero/t3.jpg'),
    require('../../assets/images/granada/thumbs/palacio-de-cultura-jorge-navas-cordonero/t4.jpg'),
  ],
  'palacio-municipal': [
    require('../../assets/images/granada/thumbs/palacio-municipal/t1.jpg'),
    require('../../assets/images/granada/thumbs/palacio-municipal/t2.jpg'),
    require('../../assets/images/granada/thumbs/palacio-municipal/t3.jpg'),
  ],
  'museo-convento-san-francisco': [
    require('../../assets/images/granada/thumbs/museo-convento-san-francisco/t1.jpg'),
    require('../../assets/images/granada/thumbs/museo-convento-san-francisco/t2.jpg'),
    require('../../assets/images/granada/thumbs/museo-convento-san-francisco/t3.jpg'),
    require('../../assets/images/granada/thumbs/museo-convento-san-francisco/t4.jpg'),
  ],
  'catedral-inmaculada': [
    require('../../assets/images/granada/thumbs/catedral-inmaculada/t1.jpg'),
    require('../../assets/images/granada/thumbs/catedral-inmaculada/t2.jpg'),
    require('../../assets/images/granada/thumbs/catedral-inmaculada/t3.jpg'),
    require('../../assets/images/granada/thumbs/catedral-inmaculada/t4.jpg'),
    require('../../assets/images/granada/thumbs/catedral-inmaculada/t5.jpg'),
  ],
  'convento-san-francisco': [
    require('../../assets/images/granada/thumbs/convento-san-francisco/t1.jpg'),
    require('../../assets/images/granada/thumbs/convento-san-francisco/t2.jpg'),
    require('../../assets/images/granada/thumbs/convento-san-francisco/t3.jpg'),
  ],
  'plaza-de-los-leones': [
    require('../../assets/images/granada/thumbs/plaza-de-los-leones/t1.jpg'),
    require('../../assets/images/granada/thumbs/plaza-de-los-leones/t2.jpg'),
    require('../../assets/images/granada/thumbs/plaza-de-los-leones/t3.jpg'),
    require('../../assets/images/granada/thumbs/plaza-de-los-leones/t4.jpg'),
  ],
  'plaza-guadalupe': [
    require('../../assets/images/granada/thumbs/plaza-guadalupe/t1.jpg'),
    require('../../assets/images/granada/thumbs/plaza-guadalupe/t2.jpg'),
    require('../../assets/images/granada/thumbs/plaza-guadalupe/t3.jpg'),
    require('../../assets/images/granada/thumbs/plaza-guadalupe/t4.jpg'),
  ],
};

function assetUri(mod: any): string {
  const m: any = typeof mod === 'number' ? Asset.fromModule(mod) : mod;
  const uri: string = m && (m.uri ?? m.localUri);
  if (/^[a-z]+:/i.test(uri) || uri.startsWith('/')) {
    if (/^[a-z]+:\/\//i.test(uri) || uri.startsWith('data:') || uri.startsWith('file:')) return uri;
    return new URL(uri, window.location.href).href;
  }
  return new URL(uri, window.location.href).href;
}

async function loadMapBackground(): Promise<string> {
  try {
    const mod = require('../../assets/images/auth-background.jpeg');
    if (Platform.OS === 'web') {
      const abs = assetUri(mod);
      try {
        const res = await fetch(abs);
        const blob = await res.blob();
        const dataUrl: string = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('read'));
          reader.readAsDataURL(blob);
        });
        return dataUrl;
      } catch {
        return abs;
      }
    }
    const [asset] = await Asset.loadAsync(mod);
    const uri = asset.localUri ?? asset.uri;
    if (uri.startsWith('data:')) return uri;
    const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    return `data:image/jpeg;base64,${b64}`;
  } catch {
    return '';
  }
}

async function loadCityImagesBase64(): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  await Promise.all(
    Object.entries(CITY_IMAGE_MODULES).map(async ([dep, mod]) => {
      try {
        if (Platform.OS === 'web') {
          result[dep] = assetUri(mod);
          return;
        }
        const [asset] = await Asset.loadAsync(mod);
        const uri = asset.localUri ?? asset.uri;
        if (uri.startsWith('data:')) {
          result[dep] = uri;
        } else {
          const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
          result[dep] = `data:image/png;base64,${b64}`;
        }
      } catch {
        result[dep] = '';
      }
    })
  );
  return result;
}

async function loadTourImagesBase64(): Promise<Record<string, string[]>> {
  const result: Record<string, string[]> = {};
  await Promise.all(
    Object.entries({ ...NAGAROTE_TOUR_IMAGE_MODULES, ...MANAGUA_TOUR_IMAGE_MODULES, ...LEON_TOUR_IMAGE_MODULES, ...JUIGALPA_TOUR_IMAGE_MODULES, ...GRANADA_TOUR_IMAGE_MODULES }).map(async ([loc, mods]) => {
      result[loc] = [];
      for (const mod of mods) {
        try {
          if (Platform.OS === 'web') {
            result[loc].push(assetUri(mod));
            continue;
          }
          const [asset] = await Asset.loadAsync(mod);
          const uri = asset.localUri ?? asset.uri;
          if (uri.startsWith('data:')) {
            result[loc].push(uri);
          } else {
            const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
            result[loc].push(`data:image/jpeg;base64,${b64}`);
          }
        } catch {
          result[loc].push('');
        }
      }
    })
  );
  return result;
}

const MAP_CENTER = '12.87,-85.21';

const leafletHtml = (center: string, apiBase: string, lang: 'es' | 'en' = 'es', cityImages: Record<string, string> = {}, mapBg: string = '', tourImages: Record<string, string[]> = {}) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f1923; overflow: hidden; background-image: ${mapBg ? `url("${mapBg}")` : 'none'}; background-repeat: no-repeat; background-size: cover; background-position: center; }
    .leaflet-container { background: #0f1923; }
    #map-overlay { display: none; }
    .pin-marker { display: flex; flex-direction: column; align-items: center; cursor: pointer; }
    .pin-marker.no-click { cursor: default; }
    .pin-icon { width: 28px; height: 28px; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.7)); }
    .pin-name {
      margin-top: 2px; font-weight: 800; font-size: 10px; color: #fff;
      white-space: normal; text-align: center; line-height: 1.15;
      max-width: 96px; text-transform: uppercase; letter-spacing: 0.4px;
      text-shadow: 0 1px 6px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5);
    }
    .pin-img {
      width: 72px; height: 40px; object-fit: cover; border-radius: 6px;
      margin-top: 3px; border: 1.5px solid rgba(255,255,255,0.7);
      box-shadow: 0 2px 8px rgba(0,0,0,0.7);
    }
    .nc-top-row {
      position: absolute; top: 16px; left: 50%; transform: translateX(-50%); z-index: 1100;
      display: flex; flex-direction: column; align-items: center; gap: 10px;
    }
    .nicaragua-title {
      position: static; transform: none;
      background: linear-gradient(135deg, #0f3460, #16213e); color: #69B6E6;
      font-weight: 800; font-size: 16px; padding: 8px 24px; border-radius: 20px;
      letter-spacing: 2px; text-transform: uppercase;
      box-shadow: 0 4px 20px rgba(105,182,230,0.4), 0 0 40px rgba(105,182,230,0.15);
      border: 1px solid rgba(105,182,230,0.3); pointer-events: none;
    }
    .nicaragua-title span { color: #ffffff; }

    .nc-leaflet-popup .leaflet-popup-content-wrapper {
      background: transparent !important; box-shadow: none !important;
      border-radius: 0 !important; padding: 0 !important; border: none !important;
    }
    .nc-leaflet-popup .leaflet-popup-content { margin: 0 !important; min-width: auto !important; }
    .nc-leaflet-popup .leaflet-popup-tip { background: #162032 !important; box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important; }
    .nc-popup {
      background: linear-gradient(135deg, #0f1923, #162032);
      border-radius: 16px; padding: 14px; width: 250px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.5);
      border: 1px solid rgba(105,182,230,0.2); color: #fff;
    }
    .nc-popup-img {
      width: 100%; height: auto; max-height: 190px; object-fit: cover; display: block;
      border-radius: 12px; margin: 0 auto 12px;
      border: 2px solid rgba(105,182,230,0.4); box-shadow: 0 4px 14px rgba(0,0,0,0.5);
      background: rgba(255,255,255,0.05);
    }
    .nc-popup-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .nc-popup-logo {
      width: 40px; height: 40px; background: linear-gradient(135deg, #69B6E6, #0f3460);
      border-radius: 10px; display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 900; color: #fff; flex-shrink: 0;
    }
    .nc-popup-brand { font-size: 12px; font-weight: 800; color: #69B6E6; letter-spacing: 0.5px; }
    .nc-popup-sub { font-size: 9px; color: rgba(255,255,255,0.4); margin-top: 1px; }
    .nc-popup-dept { font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 2px; }
    .nc-popup-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; }
    .nc-popup-coords { font-size: 10px; color: rgba(255,255,255,0.4); margin-bottom: 10px; }
    .nc-popup-desc { font-size: 11px; color: rgba(255,255,255,0.6); line-height: 1.45; margin-bottom: 12px; }
    .nc-popup-actions { display: flex; flex-wrap: wrap; gap: 6px; }
    .nc-btn {
      flex: 1 1 auto; min-width: 0; box-sizing: border-box;
      padding: 9px 8px; border-radius: 12px; border: none;
      font-weight: 700; font-size: 11px; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 4px; transition: all 0.2s;
      white-space: nowrap; overflow: hidden;
    }
    .nc-btn-route {
      background: linear-gradient(135deg, #69B6E6, #3E87C4); color: #fff;
      box-shadow: 0 4px 12px rgba(105,182,230,0.3);
    }
    .nc-btn-route:hover { transform: translateY(-1px); }
    .nc-btn-nav {
      background: linear-gradient(135deg, #0CA678, #099268); color: #fff;
      box-shadow: 0 4px 12px rgba(12,166,120,0.3); display: none;
    }
    .nc-btn-nav.show { display: flex; }
    .nc-btn-nav:hover { transform: translateY(-1px); }
    .nc-route-info {
      display: none; margin-top: 8px; padding: 8px 10px;
      background: rgba(255,255,255,0.05); border-radius: 10px;
      font-size: 11px; color: rgba(255,255,255,0.7); line-height: 1.4;
    }
    .nc-route-info.show { display: block; }
    .nc-route-info strong { color: #69B6E6; }
    .nc-btn-stop {
      background: linear-gradient(135deg, #e03131, #c92a2a) !important; color: #fff !important;
      box-shadow: 0 4px 12px rgba(224,49,49,0.4) !important; display: none;
    }
    .nc-btn-stop.show { display: flex; }
    .nc-btn-stop:hover { transform: translateY(-1px); }
    .nc-anim-dot {
      width: 20px; height: 20px; border-radius: 50%;
      background: #4DABF7; border: 3px solid #fff;
      box-shadow: 0 0 16px rgba(77,171,247,0.8), 0 0 30px rgba(77,171,247,0.3);
      animation: nc-pulse 1s ease-in-out infinite;
    }
    @keyframes nc-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.25); }
    }
    .nc-mode-toggle {
      position: static; transform: none;
      display: flex; background: linear-gradient(135deg, #0f1923, #162032);
      border-radius: 12px; overflow: hidden;
      border: 1px solid rgba(105,182,230,0.3);
      box-shadow: 0 4px 16px rgba(0,0,0,0.5);
    }
    .nc-mode-btn {
      padding: 8px 18px; font-size: 11px; font-weight: 700;
      color: rgba(255,255,255,0.5); background: transparent; border: none;
      cursor: pointer; transition: all 0.25s; letter-spacing: 0.5px;
    }
    .nc-mode-btn.active {
      background: linear-gradient(135deg, #69B6E6, #3E87C4);
      color: #fff; box-shadow: 0 2px 10px rgba(105,182,230,0.35);
    }
    .nc-mode-btn:hover:not(.active) { color: rgba(255,255,255,0.8); }
    .nc-layer-box {
      position: absolute; bottom: 16px; left: 16px; z-index: 1001;
      background: linear-gradient(135deg, #0f1923, #162032);
      border-radius: 12px; border: 1px solid rgba(105,182,230,0.25);
      box-shadow: 0 4px 16px rgba(0,0,0,0.5);
      padding: 4px; display: flex; gap: 4px;
    }
    .nc-layer-btn {
      padding: 8px 12px; font-size: 11px; font-weight: 700;
      color: rgba(255,255,255,0.55); background: transparent; border: none;
      border-radius: 8px; cursor: pointer; letter-spacing: 0.3px;
      white-space: nowrap; transition: all 0.2s; line-height: 1;
    }
    .nc-layer-btn.active {
      background: linear-gradient(135deg, #69B6E6, #0f3460);
      color: #fff;
    }
    .nc-layer-btn:hover:not(.active) { color: rgba(255,255,255,0.85); }
    .nc-view-title {
      position: static; transform: none;
      font-size: 16px; font-weight: 900; color: #fff; letter-spacing: 1px;
      text-transform: uppercase; padding: 6px 18px; border-radius: 20px;
      background: linear-gradient(135deg, #69B6E6, #0f3460);
      box-shadow: 0 4px 16px rgba(0,0,0,0.5); display: none; pointer-events: none;
      white-space: nowrap;
    }
    .nc-view-title.show { display: block; }
    .nc-biz-view {
      position: absolute; inset: 0; z-index: 1001; display: none;
      background: radial-gradient(circle at 20% 0%, #16213e, #0b1220 55%, #0f1923);
      padding: 78px 14px 20px; overflow-y: auto;
    }
    .nc-biz-view.show { display: block; }
    .nc-biz-view-head { text-align: center; margin-bottom: 14px; max-width: 1080px; margin-left: auto; margin-right: auto; padding: 8px 16px 4px; }
    .nc-biz-view-title {
      font-size: 20px; font-weight: 900; color: #fff; letter-spacing: 1px;
      text-transform: uppercase; background: linear-gradient(135deg, #69B6E6, #0f3460);
      -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
    }
    .nc-biz-view-sub { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 4px; }
    .nc-cat-bar {
      display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;
      justify-content: center;
    }
    .nc-cat-btn {
      background: rgba(255,255,255,0.08); color: #fff;
      border: 1px solid rgba(255,255,255,0.15); border-radius: 999px;
      padding: 8px 14px; font-size: 12px; font-weight: 700; cursor: pointer;
      transition: all 0.2s; white-space: nowrap;
    }
    .nc-cat-btn.active {
      background: linear-gradient(135deg, #69B6E6, #0f3460);
      border-color: #69B6E6; color: #fff;
    }
    .nc-biz-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 12px; max-width: 1080px; margin: 0 auto; padding-bottom: 20px;
    }
    .nc-biz-card {
      background: linear-gradient(135deg, #162032, #0f1923);
      border-radius: 16px; overflow: hidden; border: 1px solid rgba(105,182,230,0.18);
      box-shadow: 0 6px 22px rgba(0,0,0,0.45); display: flex; flex-direction: column;
    }
    .nc-biz-card-img {
      width: 100%; height: 150px; object-fit: cover; background: rgba(255,255,255,0.06);
      display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.25);
      font-size: 40px; font-weight: 900;
    }
    .nc-biz-card-body { padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .nc-biz-card-cat {
      font-size: 9px; font-weight: 800; color: #0CA678; text-transform: uppercase;
      letter-spacing: 0.5px; align-self: flex-start; padding: 2px 8px;
      border: 1px solid rgba(12,166,120,0.4); border-radius: 20px;
    }
    .nc-biz-card-name { font-size: 15px; font-weight: 800; color: #fff; }
    .nc-biz-card-desc { font-size: 11px; color: rgba(255,255,255,0.55); line-height: 1.45; }
    .nc-biz-card-contact { margin-top: 2px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08); }
    .nc-biz-card-line { font-size: 10px; color: #4DABF7; font-weight: 700; margin-top: 3px; word-break: break-word; }
    .nc-biz-empty { grid-column: 1 / -1; text-align: center; color: rgba(255,255,255,0.4); padding: 40px 0; font-size: 13px; }

    .nc-btn-back {
      background: rgba(255,255,255,0.1); color: #fff; flex: 0 0 auto;
    }
    .nc-btn-back:hover { background: rgba(255,255,255,0.18); transform: translateY(-1px); }
    .nc-city-dot {
      width: 14px; height: 14px; border-radius: 50%;
      border: 2.5px solid #fff;
      box-shadow: 0 2px 10px rgba(0,0,0,0.6);
    }
    .nc-city-label {
      margin-top: 3px; font-weight: 700; font-size: 10px; color: #fff;
      white-space: nowrap; text-transform: uppercase; letter-spacing: 0.4px;
      text-shadow: 0 1px 6px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5);
    }
    .nc-city-wrap { display: flex; flex-direction: column; align-items: center; cursor: pointer; }
    .nc-biz-marker {
      display: flex; flex-direction: column; align-items: center; cursor: pointer;
    }
    .nc-biz-icon {
      width: 30px; height: 30px; border-radius: 50%;
      background: linear-gradient(135deg, #0CA678, #099268);
      border: 2.5px solid #fff;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.6);
      color: #fff; font-size: 14px; font-weight: 900;
    }
    .nc-biz-label {
      margin-top: 2px; font-weight: 700; font-size: 9px; color: #fff;
      white-space: nowrap; text-transform: uppercase; letter-spacing: 0.3px;
      text-shadow: 0 1px 6px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.8);
    }
    .nc-biz-popup .leaflet-popup-content-wrapper {
      background: #0f1923 !important; border-radius: 14px !important; padding: 0 !important;
      box-shadow: 0 6px 24px rgba(0,0,0,0.6) !important; border: 1px solid rgba(12,166,120,0.35) !important;
      color: #fff;
    }
    .nc-biz-popup .leaflet-popup-content { margin: 0 !important; min-width: auto !important; }
    .nc-biz-popup .leaflet-popup-tip { background: #0f1923 !important; }
    .nc-biz-box { width: 210px; padding: 12px; }
    .nc-biz-img { width: 100%; height: 130px; object-fit: cover; border-radius: 10px; margin-bottom: 8px; background: rgba(255,255,255,0.06); }
    .nc-biz-cat { font-size: 9px; font-weight: 800; color: #0CA678; text-transform: uppercase; letter-spacing: 0.5px; }
    .nc-biz-name { font-size: 14px; font-weight: 800; color: #fff; margin: 3px 0 6px; }
    .nc-biz-desc { font-size: 10px; color: rgba(255,255,255,0.55); line-height: 1.45; }
    .nc-biz-contact { margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(12,166,120,0.2); }
    .nc-biz-line { font-size: 10px; color: #0CA678; font-weight: 700; margin-top: 3px; word-break: break-all; }
    .nc-biz-count {
      position: absolute; bottom: 16px; right: 16px; z-index: 1000;
      background: linear-gradient(135deg, #0f1923, #162032);
      border: 1px solid rgba(12,166,120,0.35); color: #fff;
      border-radius: 20px; font-size: 11px; font-weight: 800;
      padding: 7px 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.5);
      pointer-events: none;
    }
    .nc-user-gps {
      filter: drop-shadow(0 0 6px rgba(77,171,247,0.7));
      animation: nc-pulse 2s ease-in-out infinite;
    }
    .nc-user-tooltip {
      background: #162032; color: #fff; border: 1px solid rgba(105,182,230,0.3);
      border-radius: 8px; font-size: 10px; font-weight: 700; padding: 4px 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }
    .nc-user-tooltip::before { border-top-color: #162032 !important; }
    .nc-tour-btn {
      background: linear-gradient(135deg, #FCC419, #E8990C); color: #1a1a2e;
      box-shadow: 0 4px 12px rgba(252,196,25,0.3); font-weight: 800;
    }
    .nc-tour-btn:hover { transform: translateY(-1px); }
    .nc-tour-btn-purple {
      background: linear-gradient(135deg, #845EF7, #6741D9); color: #fff;
      box-shadow: 0 4px 12px rgba(132,94,247,0.35); font-weight: 800;
      flex: 1; padding: 10px 12px; border-radius: 12px; border: none;
      font-weight: 700; font-size: 12px; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: all 0.2s;
    }
    .nc-tour-btn-purple:hover { transform: translateY(-1px); }
    .nc-route-sel-panel {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1200;
      background: linear-gradient(135deg, #0f1923, #162032);
      border-radius: 16px; width: 300px; overflow: hidden;
      border: 1px solid rgba(32,201,151,0.4);
      box-shadow: 0 12px 40px rgba(0,0,0,0.7);
      display: none; flex-direction: column;
    }
    .nc-route-sel-panel.show { display: flex; }
    .nc-rs-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); flex-shrink: 0;
    }
    .nc-rs-title { font-size: 13px; font-weight: 800; color: #fff; }
    .nc-rs-sub { font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 2px; }
    .nc-rs-close {
      background: rgba(255,255,255,0.1); border: none; color: #fff;
      width: 26px; height: 26px; border-radius: 50%; font-size: 15px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .nc-rs-close:hover { background: rgba(255,255,255,0.2); }
    .nc-rs-body { padding: 10px 14px 14px; display: flex; flex-direction: column; gap: 10px; max-height: 300px; overflow-y: auto; }
    .nc-rs-card {
      width: 100%; padding: 14px; border-radius: 12px; cursor: pointer;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      transition: all 0.2s;
      display: flex; align-items: center; gap: 10px;
    }
    .nc-rs-card:hover { background: rgba(32,201,151,0.12); border-color: rgba(32,201,151,0.4); transform: translateY(-1px); }
    .nc-rs-card-body { flex: 1; min-width: 0; }
    .nc-rs-card-name { font-size: 13px; font-weight: 800; color: #fff; margin-bottom: 4px; }
    .nc-rs-card-count { font-size: 10px; color: rgba(255,255,255,0.45); font-weight: 600; }
    .nc-rs-card-arrow { flex-shrink: 0; color: #20C997; font-size: 16px; font-weight: 800; }
    .nc-rs-custom-btn {
      flex-shrink: 0; padding: 8px 10px; border-radius: 8px; border: none;
      font-size: 10px; font-weight: 800; cursor: pointer;
      background: linear-gradient(135deg, #845EF7, #6741D9); color: #fff;
      box-shadow: 0 3px 10px rgba(132,94,247,0.35);
      transition: all 0.2s;
    }
    .nc-rs-custom-btn:hover { transform: translateY(-1px); }
    .nc-route-pick-panel {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1200;
      background: linear-gradient(135deg, #0f1923, #162032);
      border-radius: 16px; width: 300px; max-height: 420px; overflow: hidden;
      border: 1px solid rgba(132,94,247,0.4);
      box-shadow: 0 12px 40px rgba(0,0,0,0.7);
      display: none; flex-direction: column;
    }
    .nc-route-pick-panel.show { display: flex; }
    .nc-rp-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); flex-shrink: 0;
    }
    .nc-rp-title { font-size: 13px; font-weight: 800; color: #fff; }
    .nc-rp-sub { font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 2px; }
    .nc-rp-close {
      background: rgba(255,255,255,0.1); border: none; color: #fff;
      width: 26px; height: 26px; border-radius: 50%; font-size: 15px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .nc-rp-close:hover { background: rgba(255,255,255,0.2); }
    .nc-rp-list { flex: 1; overflow-y: auto; padding: 6px 10px; }
    .nc-rp-item {
      width: 100%; text-align: left; display: flex; align-items: center; gap: 10px;
      padding: 9px 8px; margin: 4px 0; border-radius: 10px; cursor: pointer;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
      color: #fff; font-size: 11px; font-weight: 600; transition: all 0.15s;
    }
    .nc-rp-item:hover { background: rgba(255,255,255,0.09); }
    .nc-rp-item.selected { border-color: #845EF7; background: rgba(132,94,247,0.16); }
    .nc-rp-check {
      width: 18px; height: 18px; border-radius: 5px; border: 2px solid rgba(255,255,255,0.3);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      font-size: 11px; color: #fff;
    }
    .nc-rp-item.selected .nc-rp-check { background: #845EF7; border-color: #845EF7; }
    .nc-rp-name { flex: 1; }
    .nc-rp-btn {
      flex: 1; padding: 10px; margin: 10px 12px; border-radius: 10px; border: none;
      font-weight: 800; font-size: 12px; cursor: pointer;
      background: linear-gradient(135deg, #845EF7, #6741D9); color: #fff;
      box-shadow: 0 4px 12px rgba(132,94,247,0.35); flex-shrink: 0;
    }
    .nc-rp-btn:hover { transform: translateY(-1px); }
    @media (max-width: 480px) {
      .nc-route-sel-panel { width: calc(100% - 32px); }
      .nc-route-pick-panel { width: calc(100% - 32px); max-height: 60vh; }
    }
    .nc-tour-panel {
      position: absolute; bottom: 16px; right: 16px; z-index: 1000;
      background: linear-gradient(135deg, #0f1923, #162032);
      border-radius: 16px; width: 300px; max-height: none; overflow-y: auto;
      border: 1px solid rgba(105,182,230,0.25);
      box-shadow: 0 8px 30px rgba(0,0,0,0.6);
      transform: translateY(120%); transition: transform 0.35s ease;
      display: flex; flex-direction: column;
    }
    .nc-tour-panel.show { transform: translateY(0); }
    .nc-tour-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 14px 8px; border-bottom: 1px solid rgba(255,255,255,0.06);
      flex-shrink: 0;
    }
    .nc-tour-title { font-size: 12px; font-weight: 800; color: #fff; }
    .nc-tour-close {
      background: rgba(255,255,255,0.1); border: none; color: #fff;
      width: 26px; height: 26px; border-radius: 50%; font-size: 15px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .nc-tour-close:hover { background: rgba(255,255,255,0.2); }
    .nc-tour-img-lg {
      width: 100%; height: 140px; object-fit: cover;
      background: rgba(255,255,255,0.06); flex-shrink: 0;
    }
    .nc-tour-stop-view { padding: 10px 14px 6px; flex: 1; overflow-y: auto; }
    .nc-tour-num {
      font-size: 9px; font-weight: 800; color: #69B6E6;
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;
    }
    .nc-tour-name { font-size: 14px; font-weight: 800; color: #fff; margin-bottom: 4px; }
    .nc-tour-desc { font-size: 11px; color: rgba(255,255,255,0.5); line-height: 1.45; }
    .nc-tour-nav-row {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 6px 14px; flex-shrink: 0;
    }
    .nc-tour-nav-btn {
      width: 30px; height: 30px; border-radius: 50%; border: none;
      background: rgba(255,255,255,0.1); color: #fff; font-size: 18px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background 0.2s; flex-shrink: 0;
    }
    .nc-tour-nav-btn:hover { background: rgba(105,182,230,0.4); }
    .nc-tour-nav-btn:disabled { opacity: 0.3; cursor: default; }
    .nc-tour-dots {
      display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; flex: 1;
    }
    .nc-tour-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: rgba(255,255,255,0.2); transition: background 0.3s;
    }
    .nc-tour-dot.active { background: #69B6E6; }
    .nc-tour-actions {
      padding: 8px 14px 10px; border-top: 1px solid rgba(255,255,255,0.06);
      display: flex; gap: 8px; flex-shrink: 0;
    }
    .nc-tour-start {
      flex: 1; padding: 9px; border-radius: 10px; border: none;
      font-weight: 800; font-size: 11px; cursor: pointer;
      background: linear-gradient(135deg, #69B6E6, #3E87C4); color: #fff;
      box-shadow: 0 4px 12px rgba(105,182,230,0.3);
      transition: all 0.2s;
    }
    .nc-tour-start:hover { transform: translateY(-1px); }
    .nc-tour-stop-btn {
      flex: 1; padding: 9px; border-radius: 10px; border: none;
      font-weight: 800; font-size: 11px; cursor: pointer;
      background: linear-gradient(135deg, #e03131, #c92a2a); color: #fff;
      box-shadow: 0 4px 12px rgba(224,49,49,0.4);
      transition: all 0.2s; display: none;
    }
    .nc-tour-stop-btn.show { display: block; }
    .nc-tour-back-btn {
      flex: 0 0 auto; padding: 9px 14px; border-radius: 10px; border: none;
      font-weight: 800; font-size: 11px; cursor: pointer;
      background: rgba(255,255,255,0.1); color: #fff;
      transition: all 0.2s;
    }
    .nc-tour-back-btn:hover { background: rgba(255,255,255,0.2); transform: translateY(-1px); }
    .nc-tour-marker {
      display: flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border-radius: 50%; color: #fff;
      font-weight: 900; font-size: 13px; border: 2.5px solid #fff;
      box-shadow: 0 2px 10px rgba(0,0,0,0.5);
      overflow: hidden; background: #333;
    }
    .nc-tour-marker img {
      width: 100%; height: 100%; object-fit: cover; border-radius: 50%;
    }
    .nc-tour-popup .leaflet-popup-content-wrapper {
      background: #0f1923 !important; border-radius: 14px !important;
      box-shadow: 0 6px 24px rgba(0,0,0,0.6) !important; border: 1px solid rgba(105,182,230,0.25) !important;
      padding: 0 !important;
    }
    .nc-tour-popup .leaflet-popup-content { margin: 0 !important; min-width: auto !important; }
    .nc-tour-popup .leaflet-popup-tip { background: #0f1923 !important; }
    .nc-tp-inner { width: 200px; overflow: hidden; }
    .nc-tp-img { width: 100%; height: 110px; object-fit: cover; }
    .nc-tp-body { padding: 10px 12px; }
    .nc-tp-num { font-size: 9px; font-weight: 800; color: #69B6E6; text-transform: uppercase; letter-spacing: 0.5px; }
    .nc-tp-name { font-size: 13px; font-weight: 800; color: #fff; margin: 2px 0 4px; }
    .nc-tp-desc { font-size: 10px; color: rgba(255,255,255,0.5); line-height: 1.4; }
    .nc-tp-photos { margin-top: 8px; }
    .nc-tp-count { font-size: 9px; color: rgba(255,255,255,0.6); margin-top: 6px; font-weight: 800; text-align: center; display: block; }
    .nc-tour-photos { padding: 8px 14px 4px; flex-shrink: 0; }
    .nc-tour-ph-idx { font-size: 9px; color: rgba(255,255,255,0.55); font-weight: 800; text-align: center; margin-bottom: 4px; }
    .nc-ph-carousel {
      display: flex; overflow-x: auto; scroll-snap-type: x mandatory;
      scrollbar-width: none; -webkit-overflow-scrolling: touch; gap: 0;
      align-items: center;
    }
    .nc-ph-carousel::-webkit-scrollbar { display: none; }
    .nc-ph-slide {
      flex: 0 0 100%; scroll-snap-align: center;
      display: flex; align-items: center; justify-content: center;
      max-height: 45vh; overflow: hidden;
    }
    .nc-ph-slide img {
      width: auto; height: auto; max-width: 100%; max-height: 45vh;
      object-fit: contain; display: block;
      border-radius: 8px; background: #0a1219;
    }
    .nc-ph-slide img.nc-img-broken { display: none; }
    @media (max-width: 480px) {
      .nc-tour-panel { width: calc(100% - 24px); bottom: 12px; right: 12px; left: 12px; max-height: 50vh; }
      .nc-tour-img-lg { height: 110px; }
      .nicaragua-title { font-size: 13px; padding: 6px 16px; }
      .nc-top-row { top: 24px; }
      .nc-mode-btn { padding: 6px 12px; font-size: 10px; }
      .nc-toggle-btn { padding: 6px 12px; font-size: 10px; }
      .nc-popup { width: 220px; }
      .nc-loc-box { width: 220px; }
      .nc-tp-inner { width: 180px; }
    }
    @media (min-width: 481px) and (max-width: 768px) {
      .nc-tour-panel { width: 280px; }
    }
    .nc-tour-panel.minimized {
      width: auto; max-width: 190px; left: auto; right: 16px; bottom: 16px;
      transform: translateY(0); max-height: none;
      border-radius: 24px; overflow: hidden; cursor: pointer;
      transition: transform 0.35s ease, border-radius 0.2s ease;
    }
    @media (max-width: 480px) {
      .nc-tour-panel.minimized { right: 12px; bottom: 12px; }
    }
    .nc-tour-panel.minimized > *:not(.nc-tour-header) { display: none !important; }
    .nc-tour-panel.minimized .nc-tour-header {
      border-bottom: none; padding: 8px 12px 6px; gap: 8px;
      flex-wrap: nowrap; justify-content: space-between;
    }
    .nc-tour-panel.minimized .nc-tour-title {
      font-size: 11px; white-space: nowrap; overflow: hidden;
      text-overflow: ellipsis; max-width: 140px;
    }
    .nc-tour-panel.minimized .nc-tour-close { width: 22px; height: 22px; font-size: 13px; }
    .nc-loc-popup .leaflet-popup-content-wrapper {
      background: transparent !important; box-shadow: none !important;
      border-radius: 0 !important; padding: 0 !important; border: none !important;
    }
    .nc-loc-popup .leaflet-popup-content { margin: 0 !important; min-width: auto !important; }
    .nc-loc-popup .leaflet-popup-tip { background: #162032 !important; }
    .nc-loc-box {
      background: linear-gradient(135deg, #0f1923, #162032);
      border-radius: 14px; padding: 14px; width: 250px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.5);
      border: 1px solid rgba(77,171,247,0.3); color: #fff;
    }
    .nc-loc-icon { font-size: 22px; margin-bottom: 6px; }
    .nc-loc-title { font-size: 13px; font-weight: 800; color: #4DABF7; margin-bottom: 4px; }
    .nc-loc-dept { font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 6px; }
    .nc-loc-msg { font-size: 11px; color: rgba(255,255,255,0.55); line-height: 1.4; margin-bottom: 10px; }
    .nc-loc-btn {
      width: 100%; padding: 10px; border-radius: 10px; border: none;
      font-weight: 800; font-size: 12px; cursor: pointer; text-align: center;
      background: linear-gradient(135deg, #FCC419, #E8990C); color: #1a1a2e;
      box-shadow: 0 4px 12px rgba(252,196,25,0.3);
      transition: all 0.2s;
    }
    .nc-loc-btn:hover { transform: translateY(-1px); }
    .nc-loc-btn-gray {
      background: rgba(255,255,255,0.1); color: #fff;
      box-shadow: none; margin-top: 6px;
    }
  </style>
</head>
<body style="${mapBg ? 'background-image:url(' + mapBg + ');background-size:cover;background-position:center;' : ''}">
  <div id="map-overlay"></div>
  <div id="map"></div>
  <div class="nc-top-row">
    <div class="nicaragua-title" id="nc-title-nic"><span>${lang === 'es' ? 'Nicaragua' : 'Nicaragua'}</span></div>
    <div class="nc-view-title" id="view-title">${lang === 'es' ? 'Emprendimientos' : 'Businesses'}</div>
    <div class="nc-mode-toggle">
      <button class="nc-mode-btn active" id="tog-creative" onclick="switchMode('creative')">${lang === 'es' ? 'Ciudad Creativa' : 'Creative City'}</button>
      <button class="nc-mode-btn" id="tog-business" onclick="switchMode('business')">${lang === 'es' ? 'Emprendimientos' : 'Businesses'}</button>
    </div>
  </div>
  <div class="nc-layer-box" id="layer-box">
    <button class="nc-layer-btn active" id="layer-relieve" onclick="switchToRelieve()">⛰ ${lang === 'es' ? 'Relieve' : 'Relief'}</button>
  </div>
  <div class="nc-biz-view" id="biz-view">
    <div class="nc-biz-view-head">
      <div class="nc-biz-view-sub" id="biz-view-sub">${lang === 'es' ? 'Descubre los negocios y emprendimientos locales.' : 'Discover local businesses and ventures.'}</div>
      <div class="nc-cat-bar" id="biz-cat-bar">
        <button class="nc-cat-btn active" data-cat="General">${lang === 'es' ? 'General' : 'General'}</button>
        <button class="nc-cat-btn" data-cat="Gastronomia">Gastronom\u00eda</button>
        <button class="nc-cat-btn" data-cat="Agroindustria">Agroindustria</button>
        <button class="nc-cat-btn" data-cat="Artesania">Artesan\u00eda</button>
      </div>
    </div>
    <div class="nc-biz-grid" id="biz-grid"></div>
  </div>
  <div class="nc-tour-panel" id="tour-panel">
    <div class="nc-tour-header" id="tour-header">
      <div class="nc-tour-title" id="tour-title">${lang === 'es' ? 'Ruta Turistica' : 'Tourist Route'}</div>
      <button class="nc-tour-close" id="tour-close">&times;</button>
    </div>
    <img class="nc-tour-img-lg" id="tour-img" src="" alt="" style="display:none;" />
    <div class="nc-tour-photos" id="tour-photos"></div>
    <div class="nc-tour-stop-view" id="tour-stop-view">
      <div class="nc-tour-num" id="tour-num">${lang === 'es' ? 'Parada 1 de 10' : 'Stop 1 of 10'}</div>
      <div class="nc-tour-name" id="tour-stop-name">-</div>
      <div class="nc-tour-desc" id="tour-stop-desc">-</div>
    </div>
    <div class="nc-tour-nav-row">
      <button class="nc-tour-nav-btn" id="tour-prev">&lsaquo;</button>
      <div class="nc-tour-dots" id="tour-dots"></div>
      <button class="nc-tour-nav-btn" id="tour-next">&rsaquo;</button>
    </div>
    <div class="nc-tour-actions">
      <button class="nc-tour-start" id="tour-start">${lang === 'es' ? 'Recorrer Ruta' : 'Start Route'}</button>
      <button class="nc-tour-stop-btn" id="tour-stop-btn">${lang === 'es' ? 'Detener' : 'Stop'}</button>
      <button class="nc-tour-back-btn" id="tour-back">${lang === 'es' ? 'Regresar' : 'Back'}</button>
    </div>
  </div>
  <div class="nc-route-sel-panel" id="route-sel-panel">
    <div class="nc-rs-header">
      <div>
        <div class="nc-rs-title" id="rs-title">${lang === 'es' ? 'Granada - Selecciona una ruta' : 'Granada - Select a route'}</div>
        <div class="nc-rs-sub" id="rs-sub">${lang === 'es' ? 'Elige la ruta turistica que deseas recorrer' : 'Choose the tourist route you want to take'}</div>
      </div>
      <button class="nc-rs-close" id="rs-close">&times;</button>
    </div>
    <div class="nc-rs-body" id="rs-body"></div>
  </div>
  <div class="nc-route-pick-panel" id="route-pick-panel">
    <div class="nc-rp-header">
      <div>
        <div class="nc-rp-title" id="rp-title">${lang === 'es' ? 'Mi ruta' : 'My route'}</div>
        <div class="nc-rp-sub" id="rp-sub">${lang === 'es' ? 'Elige las paradas a visitar' : 'Choose the stops to visit'}</div>
      </div>
      <button class="nc-rp-close" id="rp-close">&times;</button>
    </div>
    <div class="nc-rp-list" id="rp-list"></div>
    <button class="nc-rp-btn" id="rp-confirm">${lang === 'es' ? 'Crear Ruta' : 'Create Route'}</button>
  </div>
  <script>
    var map = L.map('map', {
      center: [${center}],
      zoom: 7,
      minZoom: 7,
      maxZoom: 14,
      maxBounds: [[9.8, -88.3], [15.6, -81.8]],
      maxBoundsViscosity: 1.0,
      zoomControl: false,
      attributionControl: false,
      zoomAnimation: false
    });

    var hillLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Hillshade/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19, opacity: 0.5
    });
    var geoLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    });
    geoLayer.addTo(map);
    hillLayer.addTo(map);
    currentMode = 'relieve';
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    var API_BASE = '${apiBase}';
    var CITY_IMAGES = ${JSON.stringify(cityImages)};
    var MUNICIPIOS = ${JSON.stringify(MUNICIPIOS_GEO)};
    var NATIONAL_RINGS = ${JSON.stringify(NICARAGUA_GEO)};
    var MAP_BG = '${mapBg}';
    var TOUR_IMAGES = ${JSON.stringify(tourImages)};

    var borderDrawn = false;
    function drawNationalBorder() {
      if (borderDrawn || !NATIONAL_RINGS || !NATIONAL_RINGS.length) return;
      borderDrawn = true;
      L.polygon(NATIONAL_RINGS[0], {
        color: '#ffffff', weight: 1.6, opacity: 0.5, fill: false, interactive: false
      }).addTo(map);
    }
    drawNationalBorder();

    var ES = ${lang === 'es'};
    function tr(es, en) { return ES ? es : en; }

    var COLOR = '#6c7a89';
    var departamentos = [
      { name: 'Boaco', file: 'boaco', color: COLOR, highlighted: false, capital: 'Boaco', cLat: 11.5021, cLng: -85.6287 },
      { name: 'Carazo', file: 'carazo', color: COLOR, highlighted: false, capital: 'Jinotepe', cLat: 11.8496, cLng: -86.1993 },
      { name: 'Chinandega', file: 'chinandega', color: COLOR, highlighted: false, capital: 'Chinandega', cLat: 12.6294, cLng: -87.1314 },
      { name: 'Chontales', file: 'chontales', color: '#FFA94D', highlighted: true, capital: 'Juigalpa', cLat: 12.1063, cLng: -85.3645 },
      { name: 'Esteli', file: 'esteli', color: '#CC5DE8', highlighted: true, capital: 'Esteli', cLat: 13.0918, cLng: -86.3541 },
      { name: 'Granada', file: 'granada', color: '#20C997', highlighted: true, capital: 'Granada', cLat: 11.9344, cLng: -85.9561 },
      { name: 'Jinotega', file: 'jinotega', color: COLOR, highlighted: false, capital: 'Jinotega', cLat: 13.0883, cLng: -86.0022 },
      { name: 'Leon', file: 'leon', color: '#4DABF7', highlighted: true, capital: 'Leon', cLat: 12.4358, cLng: -86.8780 },
      { name: 'Madriz', file: 'madriz', color: COLOR, highlighted: false, capital: 'Somoto', cLat: 13.4814, cLng: -86.5822 },
      { name: 'Managua', file: 'managua', color: '#E64980', highlighted: true, capital: 'Managua', cLat: 12.1150, cLng: -86.2362 },
      { name: 'Masaya', file: 'masaya', color: '#FCC419', highlighted: true, capital: 'Masaya', cLat: 11.9731, cLng: -86.0950 },
      { name: 'San Juan de Oriente', file: 'sanjuanoriente', color: '#E8590C', highlighted: true, capital: 'San Juan de Oriente', cLat: 11.9059, cLng: -86.0737 },
      { name: 'Nagarote', file: 'nagarote', color: '#7048E8', highlighted: true, capital: 'Nagarote', cLat: 12.2655, cLng: -86.5631 },
      { name: 'Bluefields', file: 'bluefields', color: '#1098AD', highlighted: true, capital: 'Bluefields', cLat: 12.0129, cLng: -83.7645 },
      { name: 'Matagalpa', file: 'matagalpa', color: '#38D9A9', highlighted: true, capital: 'Matagalpa', cLat: 12.9256, cLng: -85.9178 },
      { name: 'Nueva Segovia', file: 'nueva-segovia', color: COLOR, highlighted: false, capital: 'Ocotal', cLat: 13.6321, cLng: -86.4756 },
      { name: 'RACCN', file: 'raan', color: COLOR, highlighted: false, capital: 'Bilwi', cLat: 14.0269, cLng: -83.3808 },
      { name: 'RACCS', file: 'raas', color: '#0CA678', highlighted: true, capital: 'Bluefields', cLat: 12.0132, cLng: -83.7637 },
      { name: 'Rio San Juan', file: 'rio-san-juan', color: COLOR, highlighted: false, capital: 'San Carlos', cLat: 11.1236, cLng: -84.7960 },
      { name: 'Rivas', file: 'rivas', color: COLOR, highlighted: false, capital: 'Rivas', cLat: 11.4360, cLng: -85.8265 }
    ];

    function makePinSvg(hex) {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" class="pin-icon">' +
        '<path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="' + hex + '"/>' +
        '<circle cx="12" cy="11" r="5" fill="rgba(255,255,255,0.85)"/></svg>';
    }

    function getCentroid(ll) {
      var lat = 0, lng = 0;
      for (var i = 0; i < ll.length; i++) { lat += ll[i][0]; lng += ll[i][1]; }
      return L.latLng(lat / ll.length, lng / ll.length);
    }

    var currentDep = null;
    var currentCenter = null;
    var routeLine = null;
    var userMarker = null;
    var routeCoords = null;
    var animMarker = null;
    var animTimer = null;
    var animIndex = 0;
    var navDest = null;
    var activeRouteCoords = null;
    var rerouting = false;
    var lastReroute = 0;
    var userLat = null;
    var userLng = null;
    var userLocMarker = null;
    var allPolys = {};
    var munPolys = {};
    var allMarkers = {};
    var allPins = {};
    var focusedDep = null;
    var colorsHidden = false;
    var userDepName = null;
    var lastCityClick = 0;

    function pointInPoly(lat, lng, ring) {
      var inside = false;
      for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        var xi = ring[i][0], yi = ring[i][1];
        var xj = ring[j][0], yj = ring[j][1];
        var intersect = ((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    }

    function findUserDepartment(lat, lng) {
      for (var d = 0; d < departamentos.length; d++) {
        var dep = departamentos[d];
        var polys = (allPolys[dep.name] || []).concat(munPolys[dep.name] || []);
        if (!polys.length) continue;
        for (var p = 0; p < polys.length; p++) {
          var ll = polys[p].getLatLngs();
          var rings = Array.isArray(ll[0]) ? ll[0] : ll;
          if (Array.isArray(rings[0]) && Array.isArray(rings[0][0])) {
            for (var r = 0; r < rings.length; r++) {
              var ring = rings[r].map(function(pt) { return [pt.lat, pt.lng]; });
              if (pointInPoly(lat, lng, ring)) return dep;
            }
          } else {
            var ring = rings.map(function(pt) { return [pt.lat, pt.lng]; });
            if (pointInPoly(lat, lng, ring)) return dep;
          }
        }
      }
      return null;
    }

    function getUsersLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
          setUserLocation(pos.coords.latitude, pos.coords.longitude);
        }, function() {}, { enableHighAccuracy: true, timeout: 10000 });
      }
    }

    document.addEventListener('message', function(e) {
      if (!e.data) return;
      try {
        var msg = JSON.parse(e.data);
        if (msg && msg.type === 'location' && typeof msg.lat === 'number' && typeof msg.lng === 'number') {
          setUserLocation(msg.lat, msg.lng);
        }
      } catch (err) {}
    });

    function resetToHome() {
      clearTimeout(popupTimer);
      map.closePopup();
      clearRoute();
      clearTourism();
      unfocusAll();
      var bv = document.getElementById('biz-view');
      if (bv && bv.classList.contains('show')) switchMode('creative');
      var rsp = document.getElementById('route-sel-panel');
      if (rsp) rsp.classList.remove('show');
      var rp = document.getElementById('route-pick-panel');
      if (rp) rp.classList.remove('show');
    }

    window.resetToHome = resetToHome;
    window.addEventListener('message', function(e) {
      if (!e.data) return;
      try {
        var msg = JSON.parse(e.data);
        if (msg && msg.type === 'reset') resetToHome();
      } catch (err) {}
    });

    function setUserLocation(lat, lng) {
      userLat = lat;
      userLng = lng;
      if (!userLocMarker) {
        userLocMarker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: '',
            html: '<div class="nc-user-gps"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="10" stroke="#4DABF7" stroke-width="2" fill="rgba(77,171,247,0.12)"/><circle cx="14" cy="14" r="4" fill="#4DABF7"/><line x1="14" y1="0" x2="14" y2="6" stroke="#4DABF7" stroke-width="2"/><line x1="14" y1="22" x2="14" y2="28" stroke="#4DABF7" stroke-width="2"/><line x1="0" y1="14" x2="6" y2="14" stroke="#4DABF7" stroke-width="2"/><line x1="22" y1="14" x2="28" y2="14" stroke="#4DABF7" stroke-width="2"/></svg></div>',
            iconSize: [28, 28], iconAnchor: [14, 14]
          }),
          zIndexOffset: 500
        }).addTo(map);
        userLocMarker.bindTooltip(tr('Tu ubicacion', 'Your location'), {
          permanent: false, direction: 'top',
          className: 'nc-user-tooltip'
        });
        userLocMarker.on('click', function() {
          var found = findUserDepartment(userLat, userLng);
          if (found) {
            userDepName = found.name;
            var html = '<div class="nc-loc-box">' +
              '<div class="nc-loc-icon">&#128205;</div>' +
              '<div class="nc-loc-title">' + tr('Tu ubicacion actual', 'Your current location') + '</div>' +
              '<div class="nc-loc-dept">' + found.name + '</div>' +
              '<p class="nc-loc-msg">' + tr('Estas dentro del departamento de', 'You are inside the department of') + ' <strong>' + found.name + '</strong>.' +
              (found.highlighted ? ' ' + tr('Descubre los atractivos turisticos de esta region con una ruta personalizada.', 'Discover the tourist attractions of this region with a custom route.') : ' ' + tr('Explora las rutas turisticas disponibles para ti.', 'Explore the tourist routes available for you.')) + '</p>' +
              (found.highlighted ? '<button class="nc-loc-btn" id="loc-tour-btn">' + tr('Explorar Ruta Turistica', 'Explore Tourist Route') + '</button>' : '') +
              '<button class="nc-loc-btn nc-loc-btn-gray" id="loc-close-btn">' + tr('Cerrar', 'Close') + '</button>' +
            '</div>';
            L.popup({ closeButton: false, className: 'nc-loc-popup', offset: [0, -18], maxWidth: 270 })
              .setLatLng([userLat, userLng])
              .setContent(html)
              .openOn(map);
            setTimeout(function() {
              var tb = document.getElementById('loc-tour-btn');
              var cb = document.getElementById('loc-close-btn');
              if (tb) tb.onclick = function() { map.closePopup(); showTourismRoute(found.name); };
              if (cb) cb.onclick = function() { map.closePopup(); };
            }, 50);
          }
        });
      } else {
        userLocMarker.setLatLng([lat, lng]);
      }
      var found = findUserDepartment(lat, lng);
      if (found) { userDepName = found.name; }
      if (followMode) {
        map.panTo([lat, lng], { animate: true, duration: 0.4 });
        maybeReroute(lat, lng);
      }
    }
    getUsersLocation();

    function restorePolyColors() {
      if (!colorsHidden) return;
      colorsHidden = false;
      var z = map.getZoom();
      departamentos.forEach(function(dep) {
        var polys = (allPolys[dep.name] || []).concat(munPolys[dep.name] || []);
        if (!polys.length) return;
        var baseFill = dep.highlighted ? 0.40 : 0.18;
        if (z >= 10) {
          baseFill = Math.max(0.04, baseFill * 0.15);
        } else if (z >= 9) {
          baseFill = baseFill * 0.5;
        }
        polys.forEach(function(p) { p.setStyle({ fillOpacity: baseFill, opacity: dep.highlighted ? 0.9 : 0.6 }); });
      });
    }

    function hidePolyColors() {
      if (colorsHidden) return;
      colorsHidden = true;
      departamentos.forEach(function(dep) {
        var polys = (allPolys[dep.name] || []).concat(munPolys[dep.name] || []);
        if (!polys.length) return;
        polys.forEach(function(p) { p.setStyle({ fillOpacity: 0.03, opacity: 0.08 }); });
      });
    }

    var ringsCache = null;
    var clipTimer = null;
    function ensureRings() {
      if (ringsCache) return ringsCache;
      if (NATIONAL_RINGS && NATIONAL_RINGS.length) {
        ringsCache = NATIONAL_RINGS;
        return ringsCache;
      }
      var rings = [];
      departamentos.forEach(function(dep) {
        var polys = allPolys[dep.name];
        if (!polys) return;
        polys.forEach(function(p) {
          var ll = p.getLatLngs();
          var outer = ll[0] || ll;
          if (!outer || !outer.length) return;
          rings.push(outer);
        });
      });
      if (!rings.length) return null;
      ringsCache = rings;
      return ringsCache;
    }
    function applyCountryClip() {
      var rings = ensureRings();
      if (!rings) {
        if (clipTimer) return;
        clipTimer = setTimeout(function() { clipTimer = null; applyCountryClip(); }, 500);
        return;
      }
      if (clipTimer) { clearTimeout(clipTimer); clipTimer = null; }
      var pane = document.querySelector('.leaflet-tile-pane');
      if (!pane) return;
      var pts = [];
      rings.forEach(function(ring) {
        for (var i = 0; i < ring.length; i++) {
          var pt = map.latLngToLayerPoint(ring[i]);
          pts.push(Math.round(pt.x) + 'px ' + Math.round(pt.y) + 'px');
        }
      });
      pane.style.clipPath = 'polygon(' + pts.join(',') + ')';
    }
    map.on('load viewreset zoomend moveend resize', applyCountryClip);
    applyCountryClip();

    function clearRoute() {
      if (animTimer) { clearInterval(animTimer); animTimer = null; }
      if (animMarker) { map.removeLayer(animMarker); animMarker = null; }
      if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
      if (userMarker) { map.removeLayer(userMarker); userMarker = null; }
      routeCoords = null;
      animIndex = 0;
      navDest = null;
      activeRouteCoords = null;
      lastReroute = 0;
      rerouting = false;
      modeLocked = false;
      followMode = false;
      var nb = document.getElementById('pop-nav');
      if (nb) { nb.textContent = tr('Iniciar Ruta', 'Start Route'); nb.className = 'nc-btn nc-btn-nav show'; }
    }

    function focusDepartment(depName) {
      focusedDep = depName;
      departamentos.forEach(function(dep) {
        var polys = (allPolys[dep.name] || []).concat(munPolys[dep.name] || []);
        var pin = allPins[dep.name];
        if (dep.name === depName) {
          if (polys.length) polys.forEach(function(p) { p.setStyle({ fillOpacity: 0.18, weight: 2.5, opacity: 0.55 }); p.bringToFront(); });
          if (pin) pin.setOpacity(1);
        } else {
          if (polys.length) polys.forEach(function(p) { p.setStyle({ fillOpacity: 0.01, weight: 0.5, opacity: 0.06 }); });
          if (pin) pin.setOpacity(0);
        }
      });
    }

    function unfocusAll() {
      focusedDep = null;
      var z = map.getZoom();
      departamentos.forEach(function(dep) {
        var polys = (allPolys[dep.name] || []).concat(munPolys[dep.name] || []);
        var pin = allPins[dep.name];
        if (!polys.length && !pin) return;
        var baseFill = dep.highlighted ? 0.40 : 0.18;
        if (z >= 10) {
          baseFill = Math.max(0.04, baseFill * 0.15);
        } else if (z >= 9) {
          baseFill = baseFill * 0.5;
        }
        if (polys.length) polys.forEach(function(p) { p.setStyle({ fillOpacity: baseFill, weight: dep.highlighted ? 2.5 : 1.5, opacity: dep.highlighted ? 0.9 : 0.6 }); });
        if (pin) pin.setOpacity(1);
      });
      map.setView([${center}], 7);
    }

    // "Vista Geográfica" muestra el mapa base (calles) y "Vista de Relieve" superpone
    // el relieve del terreno. Se mantiene la posición del recuadro inferior izquierdo.
    function switchToRelieve() {
      currentMode = 'relieve';
      if (!map.hasLayer(geoLayer)) geoLayer.addTo(map);
      if (!map.hasLayer(hillLayer)) hillLayer.addTo(map);
      refreshPolys();
    }

    function refreshPolys() {
      departamentos.forEach(function(dep) {
        var polys = (allPolys[dep.name] || []).concat(munPolys[dep.name] || []);
        var pin = allPins[dep.name];
        if (!polys.length) return;
        var baseFill = dep.highlighted ? 0.40 : 0.18;
        polys.forEach(function(p) { p.setStyle({ fillOpacity: baseFill, opacity: dep.highlighted ? 0.9 : 0.6 }); });
        if (pin) pin.setOpacity(1);
      });
    }

    var emprendimientos = [];
    var emprendimientosLoaded = false;
    var bizCat = 'General';
    var CATEGORIES = [
      { id: 'Gastronomia', label: 'Gastronom\u00eda' },
      { id: 'Agroindustria', label: 'Agroindustria' },
      { id: 'Artesania', label: 'Artesan\u00eda' }
    ];

    function loadEmprendimientos(done) {
      fetch(API_BASE + '/api/emprendimientos')
        .then(function(r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function(data) {
          emprendimientos = Array.isArray(data) ? data : [];
          emprendimientosLoaded = true;
          done();
        })
        .catch(function() {
          emprendimientos = [];
          emprendimientosLoaded = true;
          done();
        });
    }

    function esc(html) {
      return String(html == null ? '' : html)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function bizCardHtml(b) {
      var foto = b.fotoUrl
        ? '<img class="nc-biz-card-img" src="' + esc(b.fotoUrl) + '" alt="' + esc(b.nombre || b.name) + '" />'
        : '<div class="nc-biz-card-img">' + esc((b.nombre || b.name || 'B').charAt(0)) + '</div>';
      var nombre = esc(b.nombre || b.name);
      var tipo = esc(b.tipo || b.cat);
      var desc = esc(b.desc || b.descripcion);
      var tel = b.contactoTelefono ? '<div class="nc-biz-card-line">&#9742; ' + esc(b.contactoTelefono) + '</div>' : '';
      var mail = b.contactoEmail ? '<div class="nc-biz-card-line">&#9993; ' + esc(b.contactoEmail) + '</div>' : '';
      var redes = b.contactoRedes ? '<div class="nc-biz-card-line">&#128279; ' + esc(b.contactoRedes) + '</div>' : '';
      return '<div class="nc-biz-card">' +
        foto +
        '<div class="nc-biz-card-body">' +
          '<div class="nc-biz-card-cat">' + tipo + '</div>' +
          '<div class="nc-biz-card-name">' + nombre + '</div>' +
          (desc ? '<div class="nc-biz-card-desc">' + desc + '</div>' : '') +
          (tel || mail || redes ? '<div class="nc-biz-card-contact">' + tel + mail + redes + '</div>' : '') +
        '</div>' +
      '</div>';
    }

    function renderEmprendimientos() {
      var sub = document.getElementById('biz-view-sub');
      function catLabel(id) {
        for (var i = 0; i < CATEGORIES.length; i++) {
          if (CATEGORIES[i].id === id) return CATEGORIES[i].label;
        }
        return id;
      }
      function draw() {
        var grid = document.getElementById('biz-grid');
        grid.innerHTML = '';
        var list = bizCat === 'General'
          ? emprendimientos.slice()
          : emprendimientos.filter(function(b) {
              var t = String(b.tipo || b.cat || '');
              return t.toLowerCase() === bizCat.toLowerCase();
            });
        if (!list.length) {
          grid.innerHTML = '<div class="nc-biz-empty">' + tr('Aun no hay emprendimientos registrados.', 'No businesses registered yet.') + '</div>';
        } else {
          list.forEach(function(b) {
            grid.insertAdjacentHTML('beforeend', bizCardHtml(b));
          });
        }
        if (sub) sub.textContent = list.length + ' ' + tr('Emprendimientos para descubrir.', 'Businesses to discover.');
      }
      if (!emprendimientosLoaded) {
        loadEmprendimientos(draw);
      } else {
        draw();
      }
    }

    function selectBizCat(cat) {
      bizCat = cat;
      var btns = document.querySelectorAll('.nc-cat-btn');
      for (var i = 0; i < btns.length; i++) {
        if (btns[i].getAttribute('data-cat') === cat) {
          btns[i].classList.add('active');
        } else {
          btns[i].classList.remove('active');
        }
      }
      renderEmprendimientos();
    }

    function clearEmprendimientos() {
      var grid = document.getElementById('biz-grid');
      if (grid) grid.innerHTML = '';
    }

    function switchMode(mode) {
      var creativeBtn = document.getElementById('tog-creative');
      var businessBtn = document.getElementById('tog-business');
      var mapEl = document.getElementById('map');
      var layerBox = document.querySelector('.nc-layer-box');
      var title = document.querySelector('.nicaragua-title');
      var viewTitle = document.getElementById('view-title');
      var bizView = document.getElementById('biz-view');
      if (mode === 'business') {
        map.closePopup();
        clearRoute();
        clearTourism();
        if (mapEl) mapEl.style.display = 'none';
        if (layerBox) layerBox.style.display = 'none';
        if (title) title.style.display = 'none';
        if (viewTitle) viewTitle.classList.add('show');
        if (bizView) bizView.classList.add('show');
        var catBtns = document.querySelectorAll('.nc-cat-btn');
        for (var i = 0; i < catBtns.length; i++) {
          catBtns[i].onclick = (function(cat) {
            return function() { selectBizCat(cat); };
          })(catBtns[i].getAttribute('data-cat'));
        }
        renderEmprendimientos();
        if (creativeBtn) creativeBtn.classList.remove('active');
        if (businessBtn) businessBtn.classList.add('active');
      } else {
        if (bizView) bizView.classList.remove('show');
        clearEmprendimientos();
        if (mapEl) mapEl.style.display = 'block';
        if (layerBox) layerBox.style.display = 'flex';
        if (title) title.style.display = 'block';
        if (viewTitle) viewTitle.classList.remove('show');
        var z = map.getZoom();
        departamentos.forEach(function(dep) {
          var polys = (allPolys[dep.name] || []).concat(munPolys[dep.name] || []);
          var pin = allPins[dep.name];
          if (!polys.length) return;
          var baseFill = dep.highlighted ? 0.40 : 0.18;
          if (z >= 10) {
            baseFill = Math.max(0.04, baseFill * 0.15);
          } else if (z >= 9) {
            baseFill = baseFill * 0.5;
          }
          polys.forEach(function(p) { p.setStyle({ fillOpacity: baseFill, opacity: dep.highlighted ? 0.9 : 0.6 }); });
          if (pin) pin.setOpacity(1);
        });
        if (userLocMarker) userLocMarker.setOpacity(1);
        if (businessBtn) businessBtn.classList.remove('active');
        if (creativeBtn) creativeBtn.classList.add('active');
      }
    }

    function openPopup(dep, latLng) {
      if (modeLocked) return;
      lastCityClick = Date.now();
      clearRoute();
      currentDep = dep;
      currentCenter = latLng;
      navDest = { lat: latLng.lat, lng: latLng.lng };
      focusDepartment(dep.name);
      var isHere = userDepName === dep.name;
      var popupImg = CITY_IMAGES[dep.name] ? '<img class="nc-popup-img" src="' + CITY_IMAGES[dep.name] + '" alt="' + dep.name + '" />' : '';
      var tourData = tourismData[dep.name];
      var isMultiRoute = !!(tourData && !Array.isArray(tourData));
      var html = '<div class="nc-popup">' +
        popupImg +
        '<div class="nc-popup-coords">' + latLng.lat.toFixed(4) + ', ' + latLng.lng.toFixed(4) + '</div>' +
        (isHere
          ? '<p class="nc-popup-desc">' + tr('Estas en el departamento de', 'You are in the department of') + ' <strong>' + dep.name + '</strong>. ' +
            (tourismData[dep.name] ? tr('Explora los atractivos turisticos de tu region con una ruta personalizada.', 'Explore the tourist attractions of your region with a custom route.') : tr('Disfruta de tu estancia.', 'Enjoy your stay.')) + '</p>'
          : '<p class="nc-popup-desc">' + tr('Descubre los atractivos turisticos, cultura y naturaleza de', 'Discover the tourist attractions, culture and nature of') + ' ' + dep.name + ', ' + tr('una de las regiones destacadas de Nicaragua.', 'one of Nicaragua\\\'s highlighted regions.') + '</p>'
        ) +
        (isHere
          ? '<div class="nc-popup-actions">' +
            (isMultiRoute
              ? '<button class="nc-btn nc-tour-btn" id="pop-tour-sel" style="flex:1;">' + tr('Seleccionar Ruta', 'Select Route') + '</button>'
              : (tourData
                ? '<button class="nc-btn nc-tour-btn" id="pop-tour-full">' + tr('Ruta Completa', 'Full Route') + '</button>' +
                  '<button class="nc-btn nc-tour-btn-purple" id="pop-tour-custom">' + tr('Mi ruta', 'My route') + '</button>'
                : '')) +
            '<button class="nc-btn nc-btn-back" id="pop-back">' + tr('Regresar', 'Back') + '</button>' +
          '</div>'
          : '<div class="nc-popup-actions">' +
            '<button class="nc-btn nc-btn-route" id="pop-route">' + tr('Ver Ruta', 'View Route') + '</button>' +
            '<button class="nc-btn nc-btn-nav" id="pop-nav">' + tr('Iniciar Ruta', 'Start Route') + '</button>' +
            '<button class="nc-btn nc-btn-back" id="pop-back">' + tr('Regresar', 'Back') + '</button>' +
          '</div>' +
          (tourData ? '<div class="nc-popup-actions" style="margin-top:6px;">' +
            (isMultiRoute
              ? '<button class="nc-btn nc-tour-btn" id="pop-tour-sel" style="flex:1;">' + tr('Seleccionar Ruta', 'Select Route') + '</button>'
              : '<button class="nc-btn nc-tour-btn" id="pop-tour-full">' + tr('Ruta Completa', 'Full Route') + '</button>' +
                '<button class="nc-btn nc-tour-btn-purple" id="pop-tour-custom">' + tr('Mi ruta', 'My route') + '</button>') +
          '</div>' : '')
        ) +
        '<div class="nc-route-info" id="pop-info"></div>' +
      '</div>';
      L.popup({ closeButton: false, className: 'nc-leaflet-popup', offset: [0, -20], maxWidth: 260 })
        .setLatLng(latLng)
        .setContent(html)
        .openOn(map);
      setTimeout(function() {
        var rb = document.getElementById('pop-route');
        var nb = document.getElementById('pop-nav');
        var bb = document.getElementById('pop-back');
        var tf = document.getElementById('pop-tour-full');
        var tc = document.getElementById('pop-tour-custom');
        var ts = document.getElementById('pop-tour-sel');
        if (rb) rb.onclick = function() {
          clearTimeout(popupTimer);
          if (tf) tf.parentElement.style.display = 'none';
          if (tc) tc.parentElement.style.display = 'none';
          if (ts) ts.parentElement.style.display = 'none';
          showRoute();
        };
        if (bb) bb.onclick = function() {
          clearTimeout(popupTimer);
          map.closePopup(); unfocusAll(); clearRoute(); clearTourism();
          map.setView([${center}], 7);
        };
        if (tf) tf.onclick = function() {
          clearTimeout(popupTimer);
          showTourismRoute(dep.name, null);
        };
        if (tc) tc.onclick = function() {
          clearTimeout(popupTimer);
          showTourismRoute(dep.name, 'custom');
        };
        if (ts) ts.onclick = function() {
          clearTimeout(popupTimer);
          showTourismRoute(dep.name, null);
        };
        if (nb) nb.onclick = function() {
          clearTimeout(popupTimer);
          if (followMode) {
            stopNavigation();
          } else {
            startNavigation();
          }
        };
        popupTimer = setTimeout(function() {
          map.closePopup();
          unfocusAll();
          clearRoute();
          clearTourism();
          map.setView([${center}], 7);
        }, 10000);
      }, 50);
    }

    function showRoute() {
      if (!currentCenter) return;
      focusedDep = null;
      if (!userLat || !userLng) {
        getUsersLocation();
        var info = document.getElementById('pop-info');
        if (info) { info.className = 'nc-route-info show'; info.innerHTML = tr('Obteniendo ubicacion... intenta de nuevo.', 'Getting location... try again.'); }
        return;
      }
      if (userDepName && currentDep && userDepName === currentDep.name) {
        var info = document.getElementById('pop-info');
        var rb = document.getElementById('pop-route');
        if (rb) rb.style.display = 'none';
        if (info) {
          info.className = 'nc-route-info show';
          info.innerHTML = '<strong>' + tr('Ya estas en', 'You are already in') + ' ' + currentDep.name + '.</strong> ' +
            (tourismData[currentDep.name] ? tr('Explora la ruta turistica de esta region.', 'Explore the tourist route of this region.') : tr('Disfruta de tu estancia.', 'Enjoy your stay.'));
        }
        return;
      }
      modeLocked = true;
      navDest = { lat: currentCenter.lat, lng: currentCenter.lng };
      if (routeLine) { map.removeLayer(routeLine); }

      var url = 'https://router.project-osrm.org/route/v1/driving/' +
        userLng + ',' + userLat + ';' + currentCenter.lng + ',' + currentCenter.lat +
        '?overview=full&geometries=geojson';

      fetch(url).then(function(r) { return r.json(); }).then(function(data) {
        if (!data.routes || !data.routes.length) {
          routeCoords = [[userLat, userLng], [currentCenter.lat, currentCenter.lng]];
          activeRouteCoords = routeCoords;
          lastReroute = Date.now();
          routeLine = L.polyline(routeCoords, { color: '#69B6E6', weight: 4, opacity: 0.9 }).addTo(map);
          var dist = map.distance([userLat, userLng], [currentCenter.lat, currentCenter.lng]);
          showRouteInfo((dist / 1000).toFixed(1), '--');
          return;
        }
        var route = data.routes[0];
        var coords = route.geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
        routeCoords = [[userLat, userLng]].concat(coords).concat([[currentCenter.lat, currentCenter.lng]]);
        activeRouteCoords = coords;
        lastReroute = Date.now();
        routeLine = L.polyline(coords, { color: '#69B6E6', weight: 4, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }).addTo(map);

        userMarker = L.marker([userLat, userLng], {
          icon: L.divIcon({
            className: '',
            html: '<div style="width:16px;height:16px;background:#4DABF7;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>',
            iconSize: [16, 16], iconAnchor: [8, 8]
          })
        }).addTo(map);

        var km = (route.distance / 1000).toFixed(1);
        var min = Math.round(route.duration / 60);
        showRouteInfo(km, min);
        map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
      }).catch(function() {
        routeCoords = [[userLat, userLng], [currentCenter.lat, currentCenter.lng]];
        activeRouteCoords = routeCoords;
        lastReroute = Date.now();
        routeLine = L.polyline(routeCoords, { color: '#69B6E6', weight: 4, opacity: 0.9 }).addTo(map);
        var dist = map.distance([userLat, userLng], [currentCenter.lat, currentCenter.lng]);
        showRouteInfo((dist / 1000).toFixed(1), '--');
      });
    }

    function showRouteInfo(km, min) {
      var info = document.getElementById('pop-info');
      var rb = document.getElementById('pop-route');
      var nb = document.getElementById('pop-nav');
      var tf = document.getElementById('pop-tour-full');
      var tc = document.getElementById('pop-tour-custom');
      var ts = document.getElementById('pop-tour-sel');
      if (info) { info.className = 'nc-route-info show'; info.innerHTML = '<strong>' + km + ' km</strong>' + (min !== '--' ? ' - ~' + min + ' min' : '') + ' ' + tr('hasta', 'to') + ' ' + currentDep.name; }
      if (rb) rb.style.display = 'none';
      if (tf) tf.parentElement.style.display = 'none';
      if (tc) tc.parentElement.style.display = 'none';
      if (ts) ts.parentElement.style.display = 'none';
      if (nb) nb.className = 'nc-btn nc-btn-nav show';
    }

    function startNavigation() {
      if (followMode) { stopNavigation(); return; }
      followMode = true;
      modeLocked = true;
      lastReroute = Date.now();
      ensureRoute();
      var nb = document.getElementById('pop-nav');
      if (nb) { nb.textContent = tr('Detener', 'Stop'); nb.className = 'nc-btn nc-btn-stop show'; }
      if (userLat && userLng) {
        map.setView([userLat, userLng], Math.max(map.getZoom(), 16));
      } else {
        getUsersLocation();
      }
    }

    function stopNavigation() {
      followMode = false;
      modeLocked = false;
      var nb = document.getElementById('pop-nav');
      if (nb) { nb.textContent = tr('Iniciar Ruta', 'Start Route'); nb.className = 'nc-btn nc-btn-nav show'; }
    }

    function distToSegment(p, a, b) {
      var dX = b[1] - a[1], dY = b[0] - a[0];
      var len2 = dX * dX + dY * dY;
      var t = len2 === 0 ? 0 : ((p[1] - a[1]) * dX + (p[0] - a[0]) * dY) / len2;
      t = Math.max(0, Math.min(1, t));
      return map.distance([p[0], p[1]], [a[0] + t * dY, a[1] + t * dX]);
    }

    function distToPolyline(p, coords) {
      var min = Infinity;
      for (var i = 0; i < coords.length - 1; i++) {
        var d = distToSegment(p, coords[i], coords[i + 1]);
        if (d < min) min = d;
      }
      return min;
    }

    function fetchDrivingRoute(from, to, done) {
      var url = 'https://router.project-osrm.org/route/v1/driving/' +
        from[1] + ',' + from[0] + ';' + to[1] + ',' + to[0] +
        '?overview=full&geometries=geojson';
      fetch(url).then(function(r) { return r.json(); }).then(function(data) {
        if (data.routes && data.routes.length) {
          var c = data.routes[0].geometry.coordinates.map(function(x) { return [x[1], x[0]]; });
          done(c, data.routes[0]);
        } else {
          done(null, null);
        }
      }).catch(function() { done(null, null); });
    }

    function getTourRemainingStops(lat, lng) {
      var stops = tourActiveStops || tourismData[tourCurrentDep];
      if (!stops || !stops.length) return [];
      var best = 0, bestD = Infinity;
      for (var i = 0; i < stops.length; i++) {
        var d = map.distance([lat, lng], [stops[i].lat, stops[i].lng]);
        if (d < bestD) { bestD = d; best = i; }
      }
      return stops.slice(best);
    }

    function drawRouteLine(coords, route, toLat, toLng) {
      routeCoords = [[userLat, userLng]].concat(coords).concat([[toLat, toLng]]);
      activeRouteCoords = coords;
      if (routeLine) map.removeLayer(routeLine);
      routeLine = L.polyline(coords, { color: '#69B6E6', weight: 4, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }).addTo(map);
      if (userMarker) userMarker.setLatLng([userLat, userLng]);
      var km, min;
      if (route) {
        km = (route.distance / 1000).toFixed(1);
        min = Math.round(route.duration / 60);
      } else {
        km = (map.distance([userLat, userLng], [toLat, toLng]) / 1000).toFixed(1);
        min = '--';
      }
      showRouteInfo(km, min);
      lastReroute = Date.now();
    }

    function ensureRoute() {
      if (tourActive || routeLine || !navDest || !userLat || !userLng) return;
      fetchDrivingRoute([userLat, userLng], [navDest.lat, navDest.lng], function(c, route) {
        if (c) {
          drawRouteLine(c, route, navDest.lat, navDest.lng);
        } else {
          var coords = [[userLat, userLng], [navDest.lat, navDest.lng]];
          routeCoords = coords;
          activeRouteCoords = coords;
          if (routeLine) map.removeLayer(routeLine);
          routeLine = L.polyline(coords, { color: '#69B6E6', weight: 4, opacity: 0.9 }).addTo(map);
          showRouteInfo((map.distance([userLat, userLng], [navDest.lat, navDest.lng]) / 1000).toFixed(1), '--');
        }
      });
    }

    function maybeReroute(lat, lng) {
      if (!followMode || !modeLocked || rerouting) return;
      if (Date.now() - lastReroute < 10000) return;
      if (!activeRouteCoords || activeRouteCoords.length < 2) return;
      var off = distToPolyline([lat, lng], activeRouteCoords);
      if (off > 80) rerouteToCurrent();
    }

    function rerouteToCurrent() {
      if (!userLat || !userLng || rerouting) return;
      rerouting = true;
      var url;
      if (tourActive && tourCurrentDep) {
        var remaining = getTourRemainingStops(userLat, userLng);
        if (!remaining.length) { rerouting = false; return; }
        var wpts = [[userLat, userLng]];
        remaining.forEach(function(s) { wpts.push([s.lat, s.lng]); });
        url = 'https://router.project-osrm.org/route/v1/driving/' +
          wpts.map(function(p) { return p[1] + ',' + p[0]; }).join(';') +
          '?overview=full&geometries=geojson';
      } else if (navDest) {
        url = 'https://router.project-osrm.org/route/v1/driving/' +
          userLng + ',' + userLat + ';' + navDest.lng + ',' + navDest.lat +
          '?overview=full&geometries=geojson';
      } else {
        rerouting = false;
        return;
      }
      fetch(url).then(function(r) { return r.json(); }).then(function(data) {
        rerouting = false;
        if (!data.routes || !data.routes.length) return;
        var c = data.routes[0].geometry.coordinates.map(function(x) { return [x[1], x[0]]; });
        lastReroute = Date.now();
        if (tourActive && tourCurrentDep) {
          var dep = departamentos.find(function(d) { return d.name === tourCurrentDep; });
          var color = dep ? dep.color : '#69B6E6';
          tourOsrmCoords = c;
          activeRouteCoords = c;
          if (tourPolyline) map.removeLayer(tourPolyline);
          tourPolyline = L.polyline(c, { color: color, weight: 3.5, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }).addTo(map);
        } else {
          drawRouteLine(c, data.routes[0], navDest.lat, navDest.lng);
        }
      }).catch(function() { rerouting = false; });
    }

    function TI(k) { var a = TOUR_IMAGES[k] || []; a.img = a[0] || ''; return a; }
    var tourismData = {
      'Chontales': {
        general: [
          { name: 'Lago de Apanas', desc: 'El lago mas grande de Nicaragua, ideal para pesca deportiva y observacion de aves.', img: 'https://picsum.photos/seed/apanas/400/250', lat: 12.2415, lng: -85.4850 },
          { name: 'Juigalpa Centro', desc: 'Centro historico con arquitectura colonial, mercado municipal y vida local.', img: 'https://picsum.photos/seed/juigalpa/400/250', lat: 12.1063, lng: -85.3645 },
          { name: 'Cerro Mombachito', desc: 'Mirador natural con vista panoramica del valle de Chontales.', img: 'https://picsum.photos/seed/mombachito/400/250', lat: 12.0850, lng: -85.3900 },
          { name: 'Museo Antropologico', desc: 'Coleccion de idols precolombinos y artefactos culturales chontale\u00f1os.', img: 'https://picsum.photos/seed/museochontales/400/250', lat: 12.1090, lng: -85.3620 },
          { name: 'San Lorenzo', desc: 'Pueblo tranquilo con iglesia historica y tradicion ganadera.', img: 'https://picsum.photos/seed/sanlorenzoc/400/250', lat: 12.1300, lng: -85.4400 },
          { name: 'Comalapa', desc: 'Municipio agricola con paisajes verdes y comunidades ancestrales.', img: 'https://picsum.photos/seed/comalapa/400/250', lat: 12.0450, lng: -85.3600 },
          { name: 'Cuapa', desc: 'Lugar de la aparicion mariana, santuario religioso con devocion popular.', img: 'https://picsum.photos/seed/cuapa/400/250', lat: 12.1100, lng: -85.2600 },
          { name: 'Villa El Carmen', desc: 'Pueblo pintoresco con tradiciones religiosas y artesania local.', img: 'https://picsum.photos/seed/villaelcarmen/400/250', lat: 12.1400, lng: -85.3200 },
          { name: 'El Rama', desc: 'Puerta fluvial hacia la Costa Caribe, rodeado de rios y bosques tropicales.', img: 'https://picsum.photos/seed/elrama/400/250', lat: 12.0900, lng: -84.9500 },
          { name: 'Acoyapa', desc: 'Municipio colonial con lagos artificiales y arquitectura Republican.', img: 'https://picsum.photos/seed/acoyapa/400/250', lat: 11.9700, lng: -85.1700 },
          { name: 'La Libertad', desc: 'Ciudad en las faldas del volcan Mombacho con cafe de altura.', img: 'https://picsum.photos/seed/lalibertadc/400/250', lat: 12.1900, lng: -85.3800 }
        ],
        esplendor: [
          { name: 'Parque Central de Juigalpa', desc: 'Corazon de la ciudad con kiosco central y ambiente cotidiano chontale\u00f1o.', img: TI('parque-central-josefa-toledo-de-aguerri').img, fotos: TI('parque-central-josefa-toledo-de-aguerri'), lat: 12.1060937, lng: -85.3651257 },
          { name: 'Museo Comunitario Juigalpan', desc: 'Museo comunitario que preserva la memoria cultural e historica de Juigalpa.', img: 'https://picsum.photos/seed/juigalpan/400/250', lat: 12.1058724, lng: -85.365523 },
          { name: 'Casa y Museo de Josefa Toledo de Aguerri', desc: 'Casa museo dedicada a la educadora y escritora Josefa Toledo de Aguerri.', img: TI('casa-de-la-insigne-josefa-toledo-de-aguerri').img, fotos: TI('casa-de-la-insigne-josefa-toledo-de-aguerri'), lat: 12.106203, lng: -85.3657999 },
          { name: 'Casa de la Cultura y Creatividad Gregorio Aguilar Barea', desc: 'Casa de cultura dedicada a la figura de Gregorio Aguilar Barea.', img: TI('casa-de-la-cultura-y-creatividad-gregorio-aguilar-barea').img, fotos: TI('casa-de-la-cultura-y-creatividad-gregorio-aguilar-barea'), lat: 12.1067116, lng: -85.3650392 },
          { name: 'Catedral Nuestra Senora de la Asuncion', desc: 'Catedral de Juigalpa, centro espiritual y arquitectonico de la ciudad.', img: 'https://picsum.photos/seed/catedraljuigalpa/400/250', lat: 12.1064078, lng: -85.3645696 },
          { name: 'Museo Arqueologico Gregorio Aguilar Barea', desc: 'Museo arqueologico con piezas precolombinas del acervo chontale\u00f1o.', img: TI('museo-arqueologico-gregorio-aguilar-barea').img, fotos: TI('museo-arqueologico-gregorio-aguilar-barea'), lat: 12.1077489, lng: -85.36326 },
          { name: 'Mirador Palo Soto', desc: 'Mirador natural con vista a la ciudad y las sierras de Juigalpa.', img: TI('mirador-palo-soto').img, fotos: TI('mirador-palo-soto'), lat: 12.1090525, lng: -85.3612603 },
          { name: 'Parque Mirador Sandino', desc: 'Mirador y parque urbano en homenaje a Sandino con vista panoramica.', img: TI('mirador-sandino').img, fotos: TI('mirador-sandino'), lat: 12.1054868, lng: -85.3573865 },
          { name: 'Parque Ruben Dario', desc: 'Parque urbano dedicado al poeta con areas verdes y recreacion.', img: TI('parque-ruben-dario').img, fotos: TI('parque-ruben-dario'), lat: 12.103309, lng: -85.3710255 },
          { name: 'Zoologico Thomas Belt', desc: 'Zoologico municipal con especies nativas y centro de conservacion.', img: TI('zoologico-thomas-belt').img, fotos: TI('zoologico-thomas-belt'), lat: 12.0998532, lng: -85.3606816 },
          { name: 'Parque de la Ninez', desc: 'Parque recreativo para la ninez con juegos y areas familiares.', img: TI('parque-de-la-ninez').img, fotos: TI('parque-de-la-ninez'), lat: 12.0930654, lng: -85.3619058 }
        ]
      },
      'Esteli': {
        general: [
          { name: 'Cascada Tisey', desc: 'Cascada natural enclavada en la monta\u00f1a con agua cristalina y vegetacion exuberante.', img: 'https://picsum.photos/seed/tisey/400/250', lat: 13.1300, lng: -86.3200 },
          { name: 'Canon de Somoto', desc: 'Garganta geologica formada por el rio Coco, perfecta para rappel y natacion.', img: 'https://picsum.photos/seed/somoto/400/250', lat: 13.0433, lng: -86.5822 },
          { name: 'Reserva Miraflor', desc: 'Bosque nuboso con orquideas, colibries y senderos ecologicos.', img: 'https://picsum.photos/seed/miraflor/400/250', lat: 13.0550, lng: -86.3100 },
          { name: 'Piedra Pintada', desc: 'Petroglifos precolombinos grabados en rocas volcanicas de mas de 3000 anos.', img: 'https://picsum.photos/seed/piedrapintada/400/250', lat: 13.0700, lng: -86.3700 },
          { name: 'Esteli Centro', desc: 'Ciudad conocida como La Paris de Centro America por su clima y cultura.', img: 'https://picsum.photos/seed/esticentro/400/250', lat: 13.0918, lng: -86.3541 },
          { name: 'La Estanzuela', desc: 'Parque natural con cascadas, senderos y zona de recreacion familiar.', img: 'https://picsum.photos/seed/estanzuela/400/250', lat: 13.1000, lng: -86.3800 },
          { name: 'Monumento a la Paz', desc: 'Obra escultorica que celebra la paz en un mirador con vista a la ciudad.', img: 'https://picsum.photos/seed/monumentopaz/400/250', lat: 13.0850, lng: -86.3500 },
          { name: 'Pueblo Nuevo', desc: 'Municipio cafetalero con senderos ecologicos y cascadas escondidas.', img: 'https://picsum.photos/seed/pueblonuevo/400/250', lat: 13.0600, lng: -86.2500 },
          { name: 'Condega', desc: 'Ciudad minera con historia de la revolucion y paisajes montanosos.', img: 'https://picsum.photos/seed/condega/400/250', lat: 13.2100, lng: -86.5300 },
          { name: 'Jalapa', desc: 'Frontera con Honduras, tierra de cafe y tradiciones ancestrales.', img: 'https://picsum.photos/seed/jalapa/400/250', lat: 13.2700, lng: -86.6000 },
          { name: 'San Nicolas', desc: 'Municipio cafeicultor con vistas al canon de Somoto.', img: 'https://picsum.photos/seed/sannicolas/400/250', lat: 13.1800, lng: -86.4200 }
        ],
        raices: [
          { name: 'Parque Central 16 de Julio', desc: 'Corazon de la ciudad, punto de encuentro y ambiente cotidiano esteliano.', img: 'https://picsum.photos/seed/parque16julio/400/250', lat: 13.0928653, lng: -86.3562227 },
          { name: 'Catedral Nuestra Senora del Rosario', desc: 'Catedral de Esteli, referente espiritual y arquitectonico de la ciudad.', img: 'https://picsum.photos/seed/catedralesteli/400/250', lat: 13.0929518, lng: -86.3554688 },
          { name: 'Alcaldia Municipal de Esteli', desc: 'Sede de la municipalidad frente al parque central de Esteli.', img: 'https://picsum.photos/seed/alcaldiaesteli/400/250', lat: 13.0929634, lng: -86.3570306 },
          { name: 'Centro Cultural Felipe Urrutia', desc: 'Centro cultural con exposiciones, talleres y actividades artisticas.', img: 'https://picsum.photos/seed/felipeurrutia/400/250', lat: 13.0925182, lng: -86.3563106 },
          { name: 'Casa de Cultura y Creatividad Leonel Rugama', desc: 'Casa de la cultura dedicada al poeta y heroe Leonel Rugama.', img: 'https://picsum.photos/seed/leonelrugama/400/250', lat: 13.0917329, lng: -86.3559083 },
          { name: 'Parque de la Familia y Comunidad', desc: 'Parque recreativo con areas verdes y espacios para la familia.', img: 'https://picsum.photos/seed/parquefamilia/400/250', lat: 13.0951512, lng: -86.3616737 },
          { name: 'Biblioteca Publica Municipal Dr. Samuel Meza', desc: 'Biblioteca municipal con acervo historico y espacios de lectura.', img: 'https://picsum.photos/seed/bibliotecameza/400/250', lat: 13.0964142, lng: -86.3536332 },
          { name: 'Museo de Historia y Arqueologia Dr. Alejandro Davila Bolanos', desc: 'Museo con colecciones arqueologicas e historia regional.', img: 'https://picsum.photos/seed/museodavilaesteli/400/250', lat: 13.096578, lng: -86.3540779 },
          { name: 'Plaza Parque Domingo Gadea', desc: 'Plaza publica en homenaje a Domingo Gadea, escritor y educador.', img: 'https://picsum.photos/seed/domingogadea/400/250', lat: 13.0966985, lng: -86.3538168 },
          { name: 'Estadio Independencia', desc: 'Estadio deportivo de Esteli, casa del equipo de beisbol Independencia.', img: 'https://picsum.photos/seed/estadioindependencia/400/250', lat: 13.0976852, lng: -86.3529614 }
        ]
      },
      'Granada': {
        oeste: [
          { name: 'Cementerio Municipal de Granada', desc: 'Cementerio historico con tumbas coloniales y arquitectura unica.', img: TI('cementerio-municipal-de-granada').img, fotos: TI('cementerio-municipal-de-granada'), lat: 11.9224629, lng: -85.9668537 },
          { name: 'Antigua Fortaleza La Polvora y Museo de la Revolucion', desc: 'Antigua fortaleza colonial convertida en museo de la historia revolucionaria.', img: TI('antigua-fortaleza-la-polvora').img, fotos: TI('antigua-fortaleza-la-polvora'), lat: 11.9286067, lng: -85.9652586 },
          { name: 'Capilla Maria Auxiliadora', desc: 'Capilla colonial con devocion mariana y arquitectura sencilla.', img: TI('capilla-maria-auxiliadora').img, fotos: TI('capilla-maria-auxiliadora'), lat: 11.9281557, lng: -85.9637019 },
          { name: 'Iglesia Xalteva', desc: 'Iglesia historica del barrio Xalteva con tradiciones centenarias.', img: 'https://picsum.photos/seed/xalteva/400/250', lat: 11.928858, lng: -85.9610006 },
          { name: 'Plaza Xalteva', desc: 'Plaza principal del barrio Xalteva con ambiente local y arboles.', img: 'https://picsum.photos/seed/plazaxalteva/400/250', lat: 11.9285069, lng: -85.9602303 },
          { name: 'Parque Xalteva', desc: 'Parque recreativo en el corazon de Xalteva.', img: 'https://picsum.photos/seed/parquexalteva/400/250', lat: 11.9289528, lng: -85.9603102 },
          { name: 'Iglesia La Merced', desc: 'Templo colonial con campanario de 54 metros y vista al lago.', img: TI('iglesia-la-merced').img, fotos: TI('iglesia-la-merced'), lat: 11.9294153, lng: -85.9567695 },
          { name: 'Bate Bate Chocolate', desc: 'Taller y cafe de chocolate artesanal con degustacion.', img: 'https://picsum.photos/seed/batebate/400/250', lat: 11.930843, lng: -85.9558011 },
          { name: 'Parque Los Poetas', desc: 'Parque dedicado a los poetas nicaraguenses con ambiente artistico.', img: 'https://picsum.photos/seed/lospoetas/400/250', lat: 11.930843, lng: -85.9558011 },
          { name: 'Museo Antigua Estacion del Tren', desc: 'Museo en la antigua estacion de tren con historia del ferrocarril.', img: 'https://picsum.photos/seed/estaciontren/400/250', lat: 11.9381022, lng: -85.9551917 },
          { name: 'Museo del Chocolate', desc: 'Museo dedicado al cacao y la historia del chocolate en Nicaragua.', img: TI('museo-del-chocolate').img, fotos: TI('museo-del-chocolate'), lat: 11.9317839, lng: -85.9553079 },
          { name: 'Centro Social Tio San Antonio (Cafe de las Sonrisas)', desc: 'Cafe social que brinda oportunidades a personas con discapacidad.', img: TI('centro-social-tio-san-antonio').img, fotos: TI('centro-social-tio-san-antonio'), lat: 11.9292908, lng: -85.9559864 },
          { name: 'Mercado Municipal', desc: 'Mercado tradicional con comida local, frutas y artesanias.', img: TI('mercado-municipal').img, fotos: TI('mercado-municipal'), lat: 11.9265306, lng: -85.9547329 },
          { name: 'Palacio de la Cultura', desc: 'Sede cultural con exposiciones de arte y eventos.', img: TI('palacio-de-cultura-jorge-navas-cordonero').img, fotos: TI('palacio-de-cultura-jorge-navas-cordonero'), lat: 11.9301803, lng: -85.9545663 },
          { name: 'Palacio Nacional', desc: 'Edificio historico de arquitectura neoclasica en el centro.', img: TI('palacio-municipal').img, fotos: TI('palacio-municipal'), lat: 11.9293201, lng: -85.9539135 }
        ],
        este: [
          { name: 'Catedral Inmaculada Concepcion de Maria', desc: 'Catedral principal de Granada, icono arquitectonico de la ciudad.', img: TI('catedral-inmaculada').img, fotos: TI('catedral-inmaculada'), lat: 11.9298587, lng: -85.953358 },
          { name: 'Plaza de los Leones (Casa de los Tres Mundos)', desc: 'Centro cultural internacional en una casona colonial restaurada.', img: TI('plaza-de-los-leones').img, fotos: TI('plaza-de-los-leones'), lat: 11.9312603, lng: -85.9534381 },
          { name: 'Centro Cultural Museo Convento San Francisco', desc: 'Museo arqueologico con la Diosa de Tepetate y arte colonial.', img: TI('museo-convento-san-francisco').img, fotos: TI('museo-convento-san-francisco'), lat: 11.9323137, lng: -85.9522362 },
          { name: 'Iglesia Convento San Francisco', desc: 'Iglesia colonial del siglo XVI con historia y arquitectura unica.', img: TI('convento-san-francisco').img, fotos: TI('convento-san-francisco'), lat: 11.931874, lng: -85.9523723 },
          { name: 'Plaza Guadalupe', desc: 'Plaza historica con iglesia y ambiente tradicional granadino.', img: TI('plaza-guadalupe').img, fotos: TI('plaza-guadalupe'), lat: 11.9303265, lng: -85.9474999 },
          { name: 'Monumento a Ruben Dario', desc: 'Homenaje al principe de las letras castellanas, nativo de Granada.', img: 'https://picsum.photos/seed/monumentodario/400/250', lat: 11.9300809, lng: -85.9430774 },
          { name: 'El Muelle', desc: 'Muelle historico sobre el lago Cocibolca con paseos en barco.', img: 'https://picsum.photos/seed/muelle/400/250', lat: 11.9306163, lng: -85.9421798 },
          { name: 'Malecon de Granada', desc: 'Paseo costanero con restaurantes, vistas al lago y vida nocturna.', img: 'https://picsum.photos/seed/malecon/400/250', lat: 11.9293977, lng: -85.9419626 },
          { name: 'Centro Turistico de Granada', desc: 'Centro de informacion turistica y punto de partida a las isletas.', img: 'https://picsum.photos/seed/centroturistico/400/250', lat: 11.9196548, lng: -85.9379547 }
        ]
      },
      'Leon': {
        dariano: [
          { name: 'Museo Ruben Dario', desc: 'Casa natal del principe de las letras castellanas, hoy museo y centro cultural.', img: TI('museo-ruben-dario').img, fotos: TI('museo-ruben-dario'), lat: 12.4348287, lng: -86.882846 },
          { name: 'Monumento Los Motivos del Lobo', desc: 'Monumento escultorico inspirado en la obra de Ruben Dario.', img: TI('monumento-los-motivos-del-lobo').img, fotos: TI('monumento-los-motivos-del-lobo'), lat: 12.4351549, lng: -86.8817832 },
          { name: 'Parque de Los Poetas', desc: 'Paseo turistico peatonal que rinde homenaje a los grandes poetas de Leon.', img: TI('parque-de-los-poetas').img, fotos: TI('parque-de-los-poetas'), lat: 12.434913, lng: -86.8803485 },
          { name: 'Teatro Municipal Jose de la Cruz Mena', desc: 'Teatro historico dedicado al musico y compositor leones Jose de la Cruz Mena.', img: TI('teatro-municipal-jose-de-la-cruz-mena').img, fotos: TI('teatro-municipal-jose-de-la-cruz-mena'), lat: 12.4337353, lng: -86.8805705 },
          { name: 'UNAN - Leon', desc: 'Sede principal de la Universidad Nacional Autonoma de Nicaragua en Leon.', img: TI('unan-leon').img, fotos: TI('unan-leon'), lat: 12.4369134, lng: -86.8790549 },
          { name: 'Centro Cultural Ruben Dario', desc: 'Espacio cultural dedicado a la obra y memoria de Ruben Dario.', img: TI('centro-cultural-ruben-dario').img, fotos: TI('centro-cultural-ruben-dario'), lat: 12.4369869, lng: -86.8811847 },
          { name: 'Real Insigne Basilica Catedral de la Asuncion', desc: 'Catedral basilica, Patrimonio Mundial de la UNESCO, de Barroco colonial.', img: TI('real-insigne-basilica-de-la-asuncion').img, fotos: TI('real-insigne-basilica-de-la-asuncion'), lat: 12.4349922, lng: -86.8781115 },
          { name: 'Casa de la Salud Debayle', desc: 'Casona historica vinculada a la familia Debayle, amigos de Ruben Dario.', img: 'https://picsum.photos/seed/casadebayle/400/250', lat: 12.4341616, lng: -86.8773474 },
          { name: 'Escuela de Bellas Artes Mariana Sanson Arguello', desc: 'Escuela de artes plasticas y musicales en el casco historico de Leon.', img: TI('escuela-de-bellas-artes-mariana-sanson-arguello').img, fotos: TI('escuela-de-bellas-artes-mariana-sanson-arguello'), lat: 12.4341314, lng: -86.8773542 },
          { name: 'Paseo de los Leones', desc: 'Paseo turistico con esculturas de leones y area recreativa.', img: TI('paseo-de-los-leones').img, fotos: TI('paseo-de-los-leones'), lat: 12.4209598, lng: -86.8718847 },
          { name: 'Monumento Ruben Dario', desc: 'Monumento en homenaje al poeta Ramon Ruben Dario en el sur de la ciudad.', img: 'https://picsum.photos/seed/monumentoruben/400/250', lat: 12.4225208, lng: -86.8729801 },
          { name: 'Parque Ruben Dario', desc: 'Parque urbano del sur de Leon dedicado a la memoria del poeta.', img: TI('parque-ruben-dario').img, fotos: TI('parque-ruben-dario'), lat: 12.4176772, lng: -86.8696871 }
        ]
      },
      'San Juan de Oriente': {
        tierraviva: [
          { name: 'Mural Artistico', desc: 'Mural comunitario con la identidad ceramica y cultural de San Juan de Oriente.', img: 'https://picsum.photos/seed/muralartistico/400/250', lat: 11.9062, lng: -86.0740 },
          { name: 'Artesania Santa Maria', desc: 'Taller familiar de ceramica artesanal con tecnicas tradicionales sanjuanina.', img: 'https://picsum.photos/seed/artesaniasantmaria/400/250', lat: 11.9070894, lng: -86.0738649 },
          { name: 'Plaza San Juan de los Platos', desc: 'Plaza dedicada a la artesania de los canasteros y la tradicion del barro.', img: 'https://picsum.photos/seed/plazasanjuan/400/250', lat: 11.9060337, lng: -86.0740788 },
          { name: 'Iglesia San Juan Bautista', desc: 'Iglesia colonial del patrono del pueblo, centro de la vida religiosa local.', img: 'https://picsum.photos/seed/iglesiasanjuan/400/250', lat: 11.9054798, lng: -86.0741808 },
          { name: 'Parque Central San Juan de Oriente', desc: 'Corazon del pueblo con su kiosco, arboles centenarios y ambiente artesanal.', img: 'https://picsum.photos/seed/parquecentralsjo/400/250', lat: 11.9054848, lng: -86.074525 },
          { name: 'Sendero Mistico', desc: 'Sendero natural con miradores y vistas al volcan y la laguna de Apoyo.', img: 'https://picsum.photos/seed/senderomistico/400/250', lat: 11.9062, lng: -86.0702 },
          { name: 'Cancha Reparto David Salazar', desc: 'Cancha deportiva del reparto David Salazar, punto de encuentro vecinal.', img: 'https://picsum.photos/seed/canchadavidsalazar/400/250', lat: 11.9059802, lng: -86.0770869 },
          { name: 'Biblioteca Publica Zach Ciperski', desc: 'Biblioteca comunitaria que promueve la lectura y la cultura local.', img: 'https://picsum.photos/seed/bibliotecazach/400/250', lat: 11.9062221, lng: -86.0765554 },
          { name: 'Taller Escuela de Ceramica Valentin Lopez', desc: 'Escuela taller de ceramica en homenaje al maestro alfarero Valentin Lopez.', img: 'https://picsum.photos/seed/tallervalentin/400/250', lat: 11.9062353, lng: -86.0773819 },
          { name: 'Parque de Ferias', desc: 'Recinto de ferias artesanales y de emprendimiento del municipio.', img: 'https://picsum.photos/seed/parquedeferias/400/250', lat: 11.906045, lng: -86.0819535 },
          { name: 'Iglesia Bautista El Alfarero', desc: 'Iglesia bautista local, punto de reunion de la comunidad evang\u00e9lica.', img: 'https://picsum.photos/seed/iglesiaalfarero/400/250', lat: 11.9046433, lng: -86.0732825 },
          { name: 'Vivero San Vicente', desc: 'Vivero municipal con plantas ornamentales y especies nativas.', img: 'https://picsum.photos/seed/viverosanvicente/400/250', lat: 11.9038304, lng: -86.0718539 },
          { name: 'Comercio Chicha Bruja', desc: 'Punto tradicional de venta de chicha bruja, bebida artesanal de la zona.', img: 'https://picsum.photos/seed/chichabruja/400/250', lat: 11.905601, lng: -86.0691432 },
          { name: 'Mirador Sendero el Caballito', desc: 'Mirador sobre el sendero el Caballito con vista a la laguna de Apoyo.', img: 'https://picsum.photos/seed/miradorcaballito/400/250', lat: 11.905601, lng: -86.0691432 },
          { name: 'Mirador San Juan de Oriente', desc: 'Mirador panoramico del pueblo orientado al volcan Masaya y Apoyo.', img: 'https://picsum.photos/seed/miradorsanjuan/400/250', lat: 11.9079534, lng: -86.0681239 }
        ]
      },
      'Nagarote': {
        patrimonial: [
          { name: 'Parador Turistico Nagrandano', desc: 'Parador turístico de la Ciudad Creativa, punto de bienvenida con servicios para los visitantes.', img: TI('parador-turistico-nagrandano').img, fotos: TI('parador-turistico-nagrandano'), lat: 12.2705, lng: -86.5630 },
          { name: 'Parque Central Nagarote', desc: 'Corazon del municipio con kiosco central, arboles frondosos y ambiente familiar.', img: TI('parque-central-nagarote').img, fotos: TI('parque-central-nagarote'), lat: 12.2649425, lng: -86.5630422 },
          { name: 'Parque y Museo El Xen\u00edzaro', desc: 'Parque historico del arbol milenario El Genizaro, Monumento Nacional, con su museo municipal.', img: TI('parque-y-museo-el-xenizaro').img, fotos: TI('parque-y-museo-el-xenizaro'), lat: 12.2654, lng: -86.5624 },
          { name: 'Casa de Cultura y Creatividad Jos\u00e9 Angel L\u00f3pez', desc: 'Centro cultural municipal con talleres, exposiciones y actividades artisticas.', img: TI('casa-de-cultura').img, fotos: TI('casa-de-cultura'), lat: 12.2650159, lng: -86.5641332 },
          { name: 'Antiguo Cine Santiago', desc: 'Edificio historico del cine local, referente de la vida cultural nagrandana.', img: TI('cine-santiago').img, fotos: TI('cine-santiago'), lat: 12.2667027, lng: -86.5648034 },
          { name: 'Mirador La Concordia', desc: 'Mirador natural con vista panoramica de Nagarote y sus alrededores.', img: TI('mirador-la-concordia').img, fotos: TI('mirador-la-concordia'), lat: 12.2611446, lng: -86.5646713 },
          { name: 'Plaza Sandino', desc: 'Plaza publica en homenaje a Sandino con espacios abiertos y vida comunitaria.', img: '', fotos: [], lat: 12.2716332, lng: -86.5625028 }
        ]
      },
      'Bluefields': {
        paseo: [
          { name: 'Parque Reyes', desc: 'Parque central de Bluefields, punto de encuentro frente al puerto.', img: 'https://picsum.photos/seed/parquereyes/400/250', lat: 12.0127044, lng: -83.7649979 },
          { name: 'Palacio y Alcaldia Municipal', desc: 'Sede del gobierno municipal de Bluefields en pleno centro historico.', img: 'https://picsum.photos/seed/alcaldiabluefields/400/250', lat: 12.0127858, lng: -83.7641524 },
          { name: 'Consejo Regional', desc: 'Sede del Consejo Regional Autonomo de la Costa Caribe Sur, en el Barrio Central.', img: 'https://picsum.photos/seed/consejoregional/400/250', lat: 12.0116, lng: -83.7643 },
          { name: 'Catedral Nuestra Senora del Rosario', desc: 'Catedral catolica de Bluefields, referente de la fe y la tradicion del caribe.', img: 'https://picsum.photos/seed/catedralbluefields/400/250', lat: 12.0133623, lng: -83.7628099 },
          { name: 'Colegio San Jose', desc: 'Institucion educativa historica gestionada por la orden de los Jesuitas.', img: 'https://picsum.photos/seed/colegiosanjose/400/250', lat: 12.0134944, lng: -83.7622384 },
          { name: 'Iglesia Morava', desc: 'Iglesia morava, patrimonio de la cultura creole y de la costa caribe.', img: 'https://picsum.photos/seed/iglesiamorava/400/250', lat: 12.0122, lng: -83.7618 },
          { name: 'Museo Afrodescendiente Carl Rigby Moses', desc: 'Museo que preserva la memoria y cultura afrodescendiente de la region.', img: 'https://picsum.photos/seed/museorigby/400/250', lat: 12.0098203, lng: -83.7600724 },
          { name: 'Casa de Cultura y Creatividad Scarlett Cuadra Waters', desc: 'Centro cultural dedicado a la creatividad y tradiciones caribenas.', img: 'https://picsum.photos/seed/casacuadrawaters/400/250', lat: 12.0094281, lng: -83.7594565 },
          { name: 'Malecon de Punta Fria', desc: 'Paseo costero con vista a la bahia de Bluefields y ambiente pesquero.', img: 'https://picsum.photos/seed/maleconpuntafria/400/250', lat: 12.0093523, lng: -83.7590196 }
        ]
      },
      'Managua': {
        natural: [
          { name: 'Puerto Salvador Allende', desc: 'Malecon turistico sobre el lago Managua con restaurantes, paseos en barco y miradores.', img: TI('puerto-salvador-allende-natural').img, fotos: TI('puerto-salvador-allende-natural'), lat: 12.163278, lng: -86.2779851 },
          { name: 'Paseo de Los Estudiantes', desc: 'Paseo peatonal dedicado a la juventud con areas verdes y actividades culturales.', img: TI('paseo-de-los-estudiantes-natural').img, fotos: TI('paseo-de-los-estudiantes-natural'), lat: 12.1604646, lng: -86.273667 },
          { name: 'Paseo Xolotlan', desc: 'Malec\u00f3n costero con arena, juegos infantiles y vistas al lago Xolotlan.', img: 'https://picsum.photos/seed/paseoxolotlan/400/250', lat: 12.158596, lng: -86.2695021 },
          { name: 'Arboreto Nacional', desc: 'Vivero botanico nacional con especies nativas, ideal para paseos familiares.', img: 'https://picsum.photos/seed/arboreto/400/250', lat: 12.1478812, lng: -86.274158 },
          { name: 'Laguna de Tiscapa', desc: 'Laguna volcanica al pie de la Loma de Tiscapa con miradores y tirolesa.', img: 'https://picsum.photos/seed/tiscapa/400/250', lat: 12.1417571, lng: -86.2719803 },
          { name: 'Parque Amistad Japon Nicaragua', desc: 'Parque botanico de la hermandad entre Japon y Nicaragua con lagos y senderos.', img: 'https://picsum.photos/seed/amistadjapon/400/250', lat: 12.1253508, lng: -86.2602694 },
          { name: 'Parque Divina Misericordia', desc: 'Parque recreativo con areas verdes, juegos y espacios de convivencia.', img: 'https://picsum.photos/seed/divinamisericordia/400/250', lat: 12.103618, lng: -86.2679915 },
          { name: 'Laguna de Nejapa', desc: 'Laguna de origen volcanico al oeste de Managua con vista al Mombacho.', img: 'https://picsum.photos/seed/nejapa/400/250', lat: 12.1206529, lng: -86.3207085 },
          { name: 'Laguna de Asososca', desc: 'Laguna craterica rodeada de cerros, principal reserva de agua de Managua.', img: 'https://picsum.photos/seed/asososca/400/250', lat: 12.1340141, lng: -86.3156427 }
        ],
        gastronomica: [
          { name: 'Tiangue Hugo Chavez', desc: 'Mercado tradicional con platillos tipicos, artesanias y ambiente popular.', img: TI('tiangue-hugo-chavez').img, fotos: TI('tiangue-hugo-chavez'), lat: 12.1462794, lng: -86.2742048 },
          { name: 'La Refresqueria', desc: 'Local emblematico de comidas rapidas y gaseosas artesanales de Managua.', img: TI('la-refresqueria').img, fotos: TI('la-refresqueria'), lat: 12.1481461, lng: -86.2743712 },
          { name: 'La Casona', desc: 'Restaurante de platillos tradicionales en una casona colonial restaurada.', img: TI('la-casona').img, fotos: TI('la-casona'), lat: 12.1482251, lng: -86.274831 },
          { name: 'Las Cuatro Esquinas', desc: 'Centro gastronomico de la capital con puestos de comida tipica nicaraguense.', img: TI('las-cuatro-esquinas').img, fotos: TI('las-cuatro-esquinas'), lat: 12.1488553, lng: -86.2741324 },
          { name: 'Tiangue La Purisima', desc: 'Mercado de comidas y dulces tradicionales con devocion a la Purisima.', img: TI('tiangue-la-purisima').img, fotos: TI('tiangue-la-purisima'), lat: 12.1488907, lng: -86.2747443 },
          { name: 'La Hormiga de Oro', desc: 'Conocido punto de comidas rapidas y bebidas refrescantes de la capital.', img: TI('la-hormiga-de-oro').img, fotos: TI('la-hormiga-de-oro'), lat: 12.1506685, lng: -86.2755482 },
          { name: 'Kioscos La Criolleria y La Chiveria', desc: 'Kioscos gastronomicos al costado del Palacio Nacional con platillos criollos.', img: TI('kioscos-la-criolleria-y-la-chiveria').img, fotos: TI('kioscos-la-criolleria-y-la-chiveria'), lat: 12.1556000, lng: -86.2724000 },
          { name: 'Comidas Criollas', desc: 'Restaurante de comida tipica nicaraguense frente al Parque Central.', img: TI('comidas-criollas').img, fotos: TI('comidas-criollas'), lat: 12.1557623, lng: -86.2725965 },
          { name: 'La Chumila', desc: 'Tiangue popular con antojitos, tacos y bebidas tradicionales.', img: TI('la-chumila').img, fotos: TI('la-chumila'), lat: 12.1573011, lng: -86.2736251 },
          { name: 'Tiangue la Fe', desc: 'Mercadito de comidas y dulces caseros con ambiente comunitario.', img: TI('tiangue-la-fe').img, fotos: TI('tiangue-la-fe'), lat: 12.1578301, lng: -86.2735869 },
          { name: 'Puerto Salvador Allende', desc: 'Cierra el recorrido con restaurantes de mariscos y vida nocturna sobre el lago.', img: TI('puerto-salvador-allende').img, fotos: TI('puerto-salvador-allende'), lat: 12.163278, lng: -86.2779851 }
        ],
        historica: [
          { name: 'Centro Cultural Colonia Dambach', desc: 'Casona colonial restaurada que alberga un centro cultural con exposiciones.', img: TI('centro-cultural-colonia-dambach').img, fotos: TI('centro-cultural-colonia-dambach'), lat: 12.1553693, lng: -86.2646525 },
          { name: 'Centro Cultural Tino Lopez Guerra', desc: 'Espacio cultural dedicado al poeta y promotor Tino Lopez Guerra.', img: TI('centro-cultural-tino-lopez-guerra').img, fotos: TI('centro-cultural-tino-lopez-guerra'), lat: 12.1611208, lng: -86.2746692 },
          { name: 'Teatro Nacional Ruben Dario', desc: 'Sala de espectaculos mas importante de Nicaragua con arquitectura moderna.', img: TI('teatro-nacional-ruben-dario').img, fotos: TI('teatro-nacional-ruben-dario'), lat: 12.1584387, lng: -86.2725905 },
          { name: 'Parque Central', desc: 'Corazon historico de Managua con areas verdes y entorno institucional.', img: TI('parque-central').img, fotos: TI('parque-central'), lat: 12.1563263, lng: -86.2731509 },
          { name: 'Plaza de la Revolucion', desc: 'Plaza principal de la capital con la Catedral y el Palacio Nacional.', img: TI('plaza-de-la-revolucion').img, fotos: TI('plaza-de-la-revolucion'), lat: 12.1563891, lng: -86.2722097 },
          { name: 'Catedral Santiago Apostol de los Caballeros', desc: 'Catedral historica con arquitectura unica y el mausoleo del cardenal Obando.', img: TI('catedral-santiago-apostol').img, fotos: TI('catedral-santiago-apostol'), lat: 12.156267, lng: -86.2713644 },
          { name: 'Casa de los Pueblos', desc: 'Espacio cultural que reune las tradiciones y casas de los pueblos indigenas.', img: TI('casa-de-los-pueblos').img, fotos: TI('casa-de-los-pueblos'), lat: 12.1572103, lng: -86.2720255 },
          { name: 'Parque Heroes de la Dignidad Nacional', desc: 'Parque historico con monumentos a los heroes de la patria.', img: TI('parque-heroes-dignidad').img, fotos: TI('parque-heroes-dignidad'), lat: 12.1505623, lng: -86.2746041 },
          { name: 'Mirador Loma de Tiscapa', desc: 'Mirador natural con silueta historica y vista panoramica de Managua.', img: TI('mirador-loma-de-tiscapa').img, fotos: TI('mirador-loma-de-tiscapa'), lat: 12.1417571, lng: -86.2719803 },
          { name: 'Huellas de Acahualinca', desc: 'Sitio arqueologico con huellas humanas fosilizadas de hace 6000 anos.', img: TI('huellas-de-acahualinca').img, fotos: TI('huellas-de-acahualinca'), lat: 12.1602742, lng: -86.294377 }
        ],
        cultural: [
          { name: 'Palacio Nacional de la Cultura', desc: 'Sede del patrimonio cultural nicaraguense con exposiciones de arte.', img: TI('palacio-nacional-cultura').img, fotos: TI('palacio-nacional-cultura'), lat: 12.155522, lng: -86.2721848 },
          { name: 'Centro Cultural Tino Lopez Guerra', desc: 'Centro de artes y letras dedicado al legado del poeta Tino Lopez Guerra.', img: TI('centro-cultural-tino-lopez-guerra').img, fotos: TI('centro-cultural-tino-lopez-guerra'), lat: 12.1611208, lng: -86.2746692 },
          { name: 'Casa Replica EDSN Blanca Arauz', desc: 'Replica de la casa donde vivio la heroina Blanca Arauz, junto al hospital EDSN.', img: 'https://picsum.photos/seed/blancaarauz/400/250', lat: 12.15987, lng: -86.272528 },
          { name: 'Casa Replica - Museo Ruben Dario', desc: 'Replica de la casa natal del poeta Ruben Dario convertida en museo.', img: TI('casa-replica-museo-ruben-dario').img, fotos: TI('casa-replica-museo-ruben-dario'), lat: 12.1599452, lng: -86.2721799 },
          { name: 'Casa Replica Museo Hacienda San Jacinto', desc: 'Replica de la hacienda de la Batalla de San Jacinto con exposicion historica.', img: TI('casa-replica-san-jacinto').img, fotos: TI('casa-replica-san-jacinto'), lat: 12.1572962, lng: -86.266406 },
          { name: 'Maquetas de Representacion de la Antigua Managua', desc: 'Maquetas a escala que recrean la Managua anterior al terremoto de 1972.', img: TI('maquetas-vieja-managua').img, fotos: TI('maquetas-vieja-managua'), lat: 12.1585254, lng: -86.2698705 },
          { name: 'Cinemateca Nacional', desc: 'Espacio dedicado al cine nicaraguense con proyecciones y archivo filmico.', img: TI('cinemateca-nacional').img, fotos: TI('cinemateca-nacional'), lat: 12.1551635, lng: -86.2730548 },
          { name: 'Museo Lolita Soriano', desc: 'Museo dedicado a la educadora Lolita Soriano con colecciones pedagogicas.', img: TI('museo-lolita-soriano').img, fotos: TI('museo-lolita-soriano'), lat: 12.1378973, lng: -86.2790274 },
          { name: 'Museo Leonel Rugama', desc: 'Museo en homenaje al heroe Leonel Rugama con historia revolucionaria.', img: TI('museo-leonel-rugama').img, fotos: TI('museo-leonel-rugama'), lat: 12.1401985, lng: -86.2381338 },
          { name: 'Casa de Cultura y Creatividad Otto de la Rocha', desc: 'Casa de cultura dedicada al musico y humorista Otto de la Rocha.', img: TI('casa-de-cultura-otto-de-la-rocha').img, fotos: TI('casa-de-cultura-otto-de-la-rocha'), lat: 12.1376167, lng: -86.2786486 },
          { name: 'Casa de Cultura y Creatividad Hugo Hernandez Oviedo', desc: 'Espacio de creatividad y cultura con talleres artisticos.', img: TI('casa-de-cultura-hugo-hernandez-oviedo').img, fotos: TI('casa-de-cultura-hugo-hernandez-oviedo'), lat: 12.1380563, lng: -86.2464878 },
          { name: 'Casa de Cultura y Creatividad Alejandro Cuadra', desc: 'Casa de cultura y creatividad en homenaje al poeta Alejandro Cuadra.', img: TI('casa-de-cultura-alejandro-cuadra').img, fotos: TI('casa-de-cultura-alejandro-cuadra'), lat: 12.1431997, lng: -86.2785053 },
          { name: 'Casa de Cultura y Creatividad Camilo Zapata', desc: 'Casa de cultura y creatividad en homenaje al compositor y musico Camilo Zapata.', img: TI('casa-de-cultura-camilo-zapata').img, fotos: TI('casa-de-cultura-camilo-zapata'), lat: 12.1446, lng: -86.2782 },
          { name: 'Centro de Convenciones Olof Palme', desc: 'Centro de eventos y convenciones para la industria cultural y artistica.', img: TI('centro-de-convenciones-olof-palme').img, fotos: TI('centro-de-convenciones-olof-palme'), lat: 12.14927, lng: -86.2716396 },
          { name: 'Centro Nacional de Desarrollo del Talento Nieves Cajina', desc: 'Centro estatal para el desarrollo de talentos y expresiones creativas.', img: TI('centro-nacional-nieves-cajina').img, fotos: TI('centro-nacional-nieves-cajina'), lat: 12.1378023, lng: -86.2873972 },
          { name: 'Centro Cultural y Politecnico Jose Coronel Urtecho', desc: 'Centro cultural y academico dedicado al escritor Jose Coronel Urtecho.', img: TI('centro-cultural-jose-coronel-urtecho').img, fotos: TI('centro-cultural-jose-coronel-urtecho'), lat: 12.1518591, lng: -86.2350827 }
        ],
        recreativa: [
          { name: 'Puerto Salvador Allende', desc: 'Malecon con restaurantes, paseos en lancha y entretenimiento familiar.', img: TI('puerto-salvador-allende-recreativa').img, fotos: TI('puerto-salvador-allende-recreativa'), lat: 12.163278, lng: -86.2779851 },
          { name: 'Isla del Amor', desc: 'Isla artificial en el lago Xolotlan conectada al malecon con actividades recreativas.', img: 'https://picsum.photos/seed/isladelamor/400/250', lat: 12.1759958, lng: -86.3163757 },
          { name: 'Paseo de Los Estudiantes', desc: 'Corredor peatonal con areas de descanso y actividades juveniles.', img: TI('paseo-de-los-estudiantes-recreativa').img, fotos: TI('paseo-de-los-estudiantes-recreativa'), lat: 12.1604646, lng: -86.273667 },
          { name: 'Paseo Xolotlan', desc: 'Playa artificial familiar sobre el lago con toboganes y juegos acuaticos.', img: 'https://picsum.photos/seed/paseoxolotlan2/400/250', lat: 12.158596, lng: -86.2695021 },
          { name: 'Anfiteatro Tomas Borge', desc: 'Anfiteatro al aire libre para conciertos y eventos culturales masivos.', img: 'https://picsum.photos/seed/anfiteatrotomas/400/250', lat: 12.1555976, lng: -86.2727984 },
          { name: 'Plaza Soberania', desc: 'Plaza con fuentes y espacios de esparcimiento frente al lago Xolotlan.', img: TI('plaza-soberania').img, fotos: TI('plaza-soberania'), lat: 12.1549845, lng: -86.272125 },
          { name: 'Polideportivo Alexis Arguello', desc: 'Complejo deportivo con gimnasios y canchas para eventos deportivos.', img: 'https://picsum.photos/seed/polideportivo/400/250', lat: 12.1533975, lng: -86.2752385 },
          { name: 'Piscinas Michelle Richardson', desc: 'Complejo de piscinas recreativas para toda la familia.', img: 'https://picsum.photos/seed/michellerichardson/400/250', lat: 12.1517562, lng: -86.274681 },
          { name: 'Parque Luis Alfonso Velasquez Flores', desc: 'Parque de diversion con juegos mecanicos y areas verdes.', img: TI('parque-luis-alfonso-velasquez-flores').img, fotos: TI('parque-luis-alfonso-velasquez-flores'), lat: 12.1518375, lng: -86.2710781 },
          { name: 'Parque Heroes de la Dignidad Nacional', desc: 'Parque central de esparcimiento con monumentos historicos.', img: 'https://picsum.photos/seed/heroesdignidad2/400/250', lat: 12.1505623, lng: -86.2746041 },
          { name: 'Parque Amistad Japon Nicaragua', desc: 'Parque botanico con lagos, puentes y espacios para caminar y relajarse.', img: 'https://picsum.photos/seed/amistadjapon2/400/250', lat: 12.1253508, lng: -86.2602694 }
        ]
      },
      'Masaya': {
        circuito: [
          { name: 'Plaza de la Cultura', desc: 'Plaza principal del complejo cultural municipal con la estatua a la juventud.', img: 'https://picsum.photos/seed/plazaculturamsya/400/250', lat: 11.9811486, lng: -86.0963579 },
          { name: 'Bordados Marisol', desc: 'Taller de bordados tradicionales con diseno florido masayense.', img: 'https://picsum.photos/seed/bordadosmarisol/400/250', lat: 11.9816131, lng: -86.0967039 },
          { name: 'Bunuelos Calientes / Baho Vilma', desc: 'Local emblematico de bunuelos calientes y baho, comida tipica masayense.', img: 'https://picsum.photos/seed/bunuelos/400/250', lat: 11.9812035, lng: -86.0952225 },
          { name: 'Hamacas MCK', desc: 'Fabricacion artesanal de hamacas de colores tradicionales.', img: 'https://picsum.photos/seed/hamacasmck/400/250', lat: 11.9747131, lng: -86.1030235 },
          { name: 'Casa de las Artesanias', desc: 'Tienda y exhibicion de artesanias masayenses en el centro de la ciudad.', img: 'https://picsum.photos/seed/casaartesanias/400/250', lat: 11.9725531, lng: -86.1040482 },
          { name: 'Parque Malecon', desc: 'Malecon de Masaya con areas verdes y vista al casco urbano.', img: 'https://picsum.photos/seed/parquemalecon/400/250', lat: 11.9741147, lng: -86.1049658 },
          { name: 'Parque Central', desc: 'Corazon de Masaya rodeado de iglesias, kioscos y comercio artesanal.', img: 'https://picsum.photos/seed/parquecentralmsya/400/250', lat: 11.9737616, lng: -86.0959396 },
          { name: 'Mercado de las Artesanias', desc: 'El mercado indigena mas grande de Nicaragua, con hamacas, ceramica y cuero.', img: 'https://picsum.photos/seed/mercadomsya/400/250', lat: 11.9738138, lng: -86.0938108 },
          { name: 'Fortaleza El Coyotepe', desc: 'Fortaleza militar en la cima del cerro Coyotepe con vista panoramica.', img: 'https://picsum.photos/seed/coyotepe/400/250', lat: 11.9959564, lng: -86.0984192 }
        ],
        manos: [
          { name: 'Parque de Ferias de Monimbo', desc: 'Recinto de ferias artesanales y culturales del barrio indigena Monimbo.', img: 'https://picsum.photos/seed/feriasmonimbo/400/250', lat: 11.9562837, lng: -86.0921519 },
          { name: 'Museo La Vida en Comunidad Petroglifica El Callagua', desc: 'Museo comunitario con petroglifos precolombinos en El Callagua.', img: 'https://picsum.photos/seed/callagua/400/250', lat: 11.9640897, lng: -86.0974798 },
          { name: 'Tiangue de Monimbo', desc: 'Mercado popular de comidas y artesanias del barrio Monimbo.', img: 'https://picsum.photos/seed/tianguemonimbo/400/250', lat: 11.9674474, lng: -86.0940807 },
          { name: 'Museo Etnografico', desc: 'Museo que preserva la cultura indigena y el arte popular de Masaya.', img: 'https://picsum.photos/seed/museoetnografico/400/250', lat: 11.969164, lng: -86.091617 },
          { name: 'Casa donde fallecio Alejandro Vega', desc: 'Residencia historica vinculada al compositor Alejandro Vega Matus.', img: 'https://picsum.photos/seed/casavega/400/250', lat: 11.9744, lng: -86.0977 },
          { name: 'Centro Cultural Mercado de Artesanias', desc: 'Centro cultural dentro del mercado de artesanias con talleres y exposiciones.', img: 'https://picsum.photos/seed/centroculturalmsya/400/250', lat: 11.9738138, lng: -86.0938108 },
          { name: 'Parque Central de Masaya', desc: 'Plaza principal con la Parroquia de la Asuncion y tiendas de artesanias.', img: 'https://picsum.photos/seed/parquecentralmsya2/400/250', lat: 11.9737616, lng: -86.0959396 },
          { name: 'Casa de Cultura Alejandro Vega', desc: 'Centro cultural dedicado al musico y compositor Alejandro Vega Matus.', img: 'https://picsum.photos/seed/casaculturavega/400/250', lat: 11.9744376, lng: -86.0976393 },
          { name: 'Casa Natal de Alejandro Vega', desc: 'Lugar de nacimiento del compositor Alejandro Vega Matus.', img: 'https://picsum.photos/seed/casanatalvega/400/250', lat: 11.9742, lng: -86.0971 },
          { name: 'Parque San Juan', desc: 'Parque del barrio San Juan con ambiente tradicional y arboles centenarios.', img: 'https://picsum.photos/seed/parquesanjuan/400/250', lat: 11.974247, lng: -86.0993824 },
          { name: 'Iglesia San Juan', desc: 'Iglesia colonial del barrio San Juan con devocion a San Juan.', img: 'https://picsum.photos/seed/iglesiasanjuan/400/250', lat: 11.9739051, lng: -86.0994344 },
          { name: 'Casa mas antigua de Masaya', desc: 'Casona colonial de adobe en el sector de los corredores, cerca del Parque Central.', img: 'https://picsum.photos/seed/casamasantigua/400/250', lat: 11.9735, lng: -86.0952 },
          { name: 'Antiguo Hospital San Antonio', desc: 'Edificio historico de mas de 100 anos, hoy Hogar San Antonio.', img: 'https://picsum.photos/seed/hospitalsanantonio/400/250', lat: 11.9738, lng: -86.1003 },
          { name: 'Casa de las Artesanias', desc: 'Exposicion y venta de hamacas, ceramica y madera tallada.', img: 'https://picsum.photos/seed/casaartesanias2/400/250', lat: 11.9725531, lng: -86.1040482 },
          { name: 'Malecon de Masaya', desc: 'Paseo costanero con vistas y area de esparcimiento.', img: 'https://picsum.photos/seed/maleconmsya/400/250', lat: 11.9741147, lng: -86.1049658 },
          { name: 'Las 7 Esquinas', desc: 'Interseccion historica de siete calles, icono urbano de Masaya.', img: 'https://picsum.photos/seed/sieteesquinas/400/250', lat: 11.9765466, lng: -86.0985315 },
          { name: 'Antiguo Hotel Las Azcarete', desc: 'Sitio del famoso Hotel Azcarate del siglo XIX, desde las 7 Esquinas hacia el sureste.', img: 'https://picsum.photos/seed/hotelazcarate/400/250', lat: 11.9757, lng: -86.0978 },
          { name: 'Casa del poeta Manuel Maldonado', desc: 'Casa del poeta Manuel Maldonado, vecino del antiguo Hotel Azcarate.', img: 'https://picsum.photos/seed/casamaldonado/400/250', lat: 11.9758, lng: -86.0980 },
          { name: 'Museo Davila Bolanos', desc: 'Casa museo del doctor Alejandro Davila Bolanos en el casco historico.', img: 'https://picsum.photos/seed/davilabolanos/400/250', lat: 11.9749937, lng: -86.0975998 },
          { name: 'Antigua Alcaldia de Masaya', desc: 'Antiguo edificio municipal en el corazon del casco historico.', img: 'https://picsum.photos/seed/antiguaalcaldia/400/250', lat: 11.9739, lng: -86.0957 },
          { name: 'Parroquia Nuestra Senora de la Asuncion', desc: 'Iglesia barroca del siglo XVIII, Patrimonio Cultural de la Nacion.', img: 'https://picsum.photos/seed/parroquiaasuncion/400/250', lat: 11.9739694, lng: -86.0961135 },
          { name: 'Iglesia El Calvario', desc: 'Iglesia en la zona sur de Masaya con tradicion de semana santa.', img: 'https://picsum.photos/seed/iglesiacalvario/400/250', lat: 11.9704504, lng: -86.0886156 }
        ]
      },
      'Matagalpa': {
        general: [
          { name: 'Selva Negra', desc: 'Eco-resort en la monta\u00f1a con cafe organico, senderos y avistamiento.', img: 'https://picsum.photos/seed/selvanegra/400/250', lat: 13.0200, lng: -85.8700 },
          { name: 'Cafe Las Nubes', desc: 'Finca de cafe de especialidad a 1400 metros sobre el nivel del mar.', img: 'https://picsum.photos/seed/cafelasnubes/400/250', lat: 12.9800, lng: -85.9000 },
          { name: 'Mirador de la Cumplida', desc: 'Mirador natural con vista a valles de cafe y monta\u00f1as centrales.', img: 'https://picsum.photos/seed/cumplida/400/250', lat: 12.9500, lng: -85.8800 },
          { name: 'Pantanal de Matagalpa', desc: 'Area humeda con biodiversidad unica, tortugas y aves acuaticas.', img: 'https://picsum.photos/seed/pantanal/400/250', lat: 12.9100, lng: -85.9200 },
          { name: 'Matagalpa Centro', desc: 'Ciudad monta\u00f1osa con clima templado, mercados y vida nocturna.', img: 'https://picsum.photos/seed/matagalpacentro/400/250', lat: 12.9256, lng: -85.9178 },
          { name: 'Macizos Volcanicos', desc: 'Zona de volcanes y lagunas con senderos de aventura.', img: 'https://picsum.photos/seed/macizos/400/250', lat: 13.0000, lng: -85.8600 },
          { name: 'El Arenal', desc: 'Aguas termales naturales en medio del bosque nuboso.', img: 'https://picsum.photos/seed/arenal/400/250', lat: 12.9600, lng: -85.8900 },
          { name: 'San Ramon', desc: 'Municipio productor de cafe con cascadas y vistas impresionantes.', img: 'https://picsum.photos/seed/sanramon/400/250', lat: 12.9300, lng: -85.8500 },
          { name: 'Waslala', desc: 'Ciudad del cafe y cacao con comunidades indigenas.', img: 'https://picsum.photos/seed/waslala/400/250', lat: 13.0300, lng: -85.7900 },
          { name: 'Bonanza', desc: 'Municipio minero con rio de aguas claras y bosques protegidos.', img: 'https://picsum.photos/seed/bonanza/400/250', lat: 13.0400, lng: -85.7400 },
          { name: 'Santa Maria de Ostuma', desc: 'Municipio en las monta\u00f1as con lagos crater y clima frio.', img: 'https://picsum.photos/seed/ostuma/400/250', lat: 12.9000, lng: -85.8700 }
        ],
        raices: [
          { name: 'Mirador el Calvario', desc: 'Cerro mirador frente al centro de Matagalpa con areas de recreacion.', img: 'https://picsum.photos/seed/calvario/400/250', lat: 12.9300371, lng: -85.9254556 },
          { name: 'Guayacan Coffee', desc: 'Finca y tostaduria de cafe de especialidad con recorridos del campo a la taza.', img: 'https://picsum.photos/seed/guayacan/400/250', lat: 12.9220516, lng: -85.9995316 },
          { name: 'El Castillo del Cacao', desc: 'Espacio dedicado al cacao con talleres, chocolate y tradicion local.', img: 'https://picsum.photos/seed/castillocacao/400/250', lat: 12.9421737, lng: -85.8998437 },
          { name: 'Tiangue de Artesanias', desc: 'Modulos de artesanias en la calle del rio, contiguos a la cancha del rio.', img: 'https://picsum.photos/seed/tiangueartesanias/400/250', lat: 12.9288, lng: -85.9208 },
          { name: 'Parque Los Monos', desc: 'Parque urbano con esculturas de monos, icono recreativo de Matagalpa.', img: 'https://picsum.photos/seed/parquelosmonos/400/250', lat: 12.9349581, lng: -85.9168783 },
          { name: 'Parque Francisco Morazan', desc: 'Parque del centro de Matagalpa en homenaje al heroe Francisco Morazan.', img: 'https://picsum.photos/seed/parquemorazan/400/250', lat: 12.9281738, lng: -85.9184534 },
          { name: 'Catedral de San Pedro Apostol', desc: 'Catedral de Matagalpa, centro espiritual y arquitectonico de la ciudad.', img: 'https://picsum.photos/seed/catedralmatagalpa/400/250', lat: 12.9286613, lng: -85.9183884 },
          { name: 'Casa de Cultura y Creatividad Carlos Arroyo Pineda', desc: 'Casa de la cultura dedicada a la creatividad y artistas locales.', img: 'https://picsum.photos/seed/casaarroyopineda/400/250', lat: 12.9281823, lng: -85.9179481 },
          { name: 'Parque Ruben Dario', desc: 'Parque con areas verdes y ambiente familiar en el corazon de Matagalpa.', img: 'https://picsum.photos/seed/parquerubenmatagalpa/400/250', lat: 12.9216957, lng: -85.9197616 },
          { name: 'Reserva Natural Cerro Arenal', desc: 'Reserva natural con senderos y vista a las monta\u00f1as de Matagalpa.', img: 'https://picsum.photos/seed/cerroarenal/400/250', lat: 12.9160756, lng: -85.9162963 }
        ]
      },
      'RACCS': [
        { name: 'Bluefields Centro', desc: 'Ciudad portuaria con arquitectura caribena y cultura creole unica.', img: 'https://picsum.photos/seed/bluefields/400/250', lat: 12.0132, lng: -83.7637 },
        { name: 'Corn Island', desc: 'Islas caribenas con playa de arena blanca y agua turquesa.', img: 'https://picsum.photos/seed/cornisland/400/250', lat: 12.1667, lng: -83.0500 },
        { name: 'Laguna de Perlas', desc: 'Laguna costera con pescadores y manglares, puerta a las islas del Caribe.', img: 'https://picsum.photos/seed/lagunaperlas/400/250', lat: 12.3000, lng: -83.5667 },
        { name: 'El Bluff', desc: 'Pueblo pesquero con playas virgenes y arrecifes de coral.', img: 'https://picsum.photos/seed/elbluff/400/250', lat: 11.9833, lng: -83.7333 },
        { name: 'Cukra Hill', desc: 'Cerro con mirador de 360 grados sobre Bluefields y el Caribe.', img: 'https://picsum.photos/seed/cukra/400/250', lat: 12.0300, lng: -83.7400 },
        { name: 'Pearl Lagoon', desc: 'Laguna protegida con manglares y avifauna caribena excepcional.', img: 'https://picsum.photos/seed/pearllagoon/400/250', lat: 12.3500, lng: -83.5200 },
        { name: 'Orinoco', desc: 'Comunidad costera con cultura misquito y pesca artesanal.', img: 'https://picsum.photos/seed/orinoco/400/250', lat: 12.1800, lng: -83.6400 },
        { name: 'La Cruz de Rio Grande', desc: 'Puerto fluvial historico con conexiones al rio Escondido.', img: 'https://picsum.photos/seed/lacruzriogrande/400/250', lat: 11.9500, lng: -83.8600 },
        { name: 'Rama', desc: 'Pueblo en la desembocadura del rio Rama, acceso al Caribe profundo.', img: 'https://picsum.photos/seed/rama/400/250', lat: 11.8400, lng: -84.1700 },
        { name: 'Muelle de los Bueyes', desc: 'Municipio ganadero con rio Coco y tradiciones mesitena.', img: 'https://picsum.photos/seed/muelle/400/250', lat: 12.1400, lng: -83.8800 },
        { name: 'Bocana de Paiwas', desc: 'Comunidad riberena con selva virgen y biodiversidad unica.', img: 'https://picsum.photos/seed/bocanapaiwas/400/250', lat: 12.1200, lng: -83.9300 }
      ]
    };

    var tourMarkers = [];
    var tourPolyline = null;
    var tourAnimTimer = null;
    var tourAnimIndex = 0;
    var tourActive = false;
    var tourCurrentDep = null;
    var tourOsrmCoords = null;
    var tourTravelMarker = null;
    var tourPopup = null;
    var tourStopPopup = null;
    var pickerSelected = {};
    var currentTourStops = null;
    var tourActiveStops = null;
    var modeLocked = false;
    var followMode = false;
    var popupTimer = null;

    function clearTourism() {
      if (tourAnimTimer) { clearInterval(tourAnimTimer); tourAnimTimer = null; }
      tourMarkers.forEach(function(m) { map.removeLayer(m); });
      tourMarkers = [];
      if (tourPolyline) { map.removeLayer(tourPolyline); tourPolyline = null; }
      if (tourTravelMarker) { map.removeLayer(tourTravelMarker); tourTravelMarker = null; }
      if (tourStopPopup) { map.removeLayer(tourStopPopup); tourStopPopup = null; }
      tourActive = false;
      tourOsrmCoords = null;
      tourCurrentDep = null;
      tourActiveStops = null;
      activeRouteCoords = null;
      lastReroute = 0;
      focusedDep = null;
      modeLocked = false;
      followMode = false;
      var tpanel = document.getElementById('tour-panel');
      if (tpanel) { tpanel.classList.remove('show'); tpanel.classList.remove('minimized'); }
      var rp = document.getElementById('route-pick-panel');
      if (rp) rp.classList.remove('show');
      var rsp = document.getElementById('route-sel-panel');
      if (rsp) rsp.classList.remove('show');
      var ts = document.getElementById('tour-start');
      var tstop = document.getElementById('tour-stop-btn');
      if (ts) ts.style.display = '';
      if (tstop) { tstop.style.display = 'none'; tstop.classList.remove('show'); }
    }

    function toursCarouselHTML(fotos, name) {
      var n = (fotos || []).length;
      if (!n) return '';
      var out = '<div class="nc-ph-carousel">';
      for (var k = 0; k < n; k++) {
        out += '<div class="nc-ph-slide"><img class="nc-ph-img" src="' + (fotos[k] || '') + '" alt="' + name + ' ' + (k + 1) + '" /></div>';
      }
      out += '</div>';
      return out;
    }

    function wireCarousel(root, total) {
      var car = root ? root.querySelector('.nc-ph-carousel') : null;
      if (!car) return;
      car.querySelectorAll('.nc-ph-slide img').forEach(function(img) {
        img.addEventListener('error', function() {
          img.classList.add('nc-img-broken');
        });
      });
      var idxEl = root.querySelector('[data-ph-idx]');
      var updateIdx = function() {
        var c = car.scrollLeft / Math.max(1, car.clientWidth);
        var i = Math.min(total - 1, Math.max(0, Math.round(c)));
        if (idxEl) idxEl.textContent = (i + 1) + ' / ' + total;
      };
      car.addEventListener('scroll', updateIdx);
    }

    function updateTourPanel(stops, idx) {
      if (!stops || !stops[idx]) return;
      var s = stops[idx];
      var fotos = s.fotos && s.fotos.length ? s.fotos : [];
      document.getElementById('tour-num').textContent = tr('Parada', 'Stop') + ' ' + (idx + 1) + ' ' + tr('de', 'of') + ' ' + stops.length;
      document.getElementById('tour-stop-name').textContent = s.name;
      document.getElementById('tour-stop-desc').textContent = s.desc;
      var dots = '';
      for (var d = 0; d < stops.length; d++) {
        dots += '<div class="nc-tour-dot' + (d === idx ? ' active' : '') + '"></div>';
      }
      document.getElementById('tour-dots').innerHTML = dots;
      var strip = document.getElementById('tour-photos');
      if (fotos.length) {
        strip.innerHTML = toursCarouselHTML(fotos, s.name) +
          '<div class="nc-tour-ph-idx" data-ph-idx>1 / ' + fotos.length + '</div>';
      } else {
        strip.innerHTML = '';
      }
      wireCarousel(strip, fotos.length);
      document.getElementById('tour-prev').disabled = (idx === 0);
      document.getElementById('tour-next').disabled = (idx === stops.length - 1);
    }

    function showTourStopPopup(stop, idx, total, color) {
      if (tourStopPopup) { map.removeLayer(tourStopPopup); tourStopPopup = null; }
      var fotos = stop.fotos && stop.fotos.length ? stop.fotos : [];
      var fotosHtml = '';
      if (fotos.length) {
        fotosHtml += '<div class="nc-tp-photos">' +
          toursCarouselHTML(fotos, stop.name) +
          '<div class="nc-tp-count" data-ph-idx>1 / ' + fotos.length + '</div>' +
        '</div>';
      }
      var html = '<div class="nc-tp-inner">' +
        fotosHtml +
        '<div class="nc-tp-body">' +
          '<div class="nc-tp-num">' + tr('Parada', 'Stop') + ' ' + (idx + 1) + ' ' + tr('de', 'of') + ' ' + total + '</div>' +
          '<div class="nc-tp-name">' + stop.name + '</div>' +
          '<div class="nc-tp-desc">' + stop.desc + '</div>' +
        '</div>' +
      '</div>';
      tourStopPopup = L.popup({ closeButton: false, className: 'nc-tour-popup', offset: [0, -18], maxWidth: 230 })
        .setLatLng([stop.lat, stop.lng])
        .setContent(html)
        .openOn(map);
      if (fotos.length) wireCarousel(tourStopPopup.getElement(), fotos.length);
    }

    function showTourismRoute(depName, mode) {
      map.closePopup();
      var data = tourismData[depName];
      if (!data) return;
      if (!Array.isArray(data)) {
        openRouteSelPanel(depName);
        return;
      }
      if (mode === 'custom') {
        openRoutePicker(depName);
      } else {
        buildTourismRoute(depName, data);
      }
    }

    var routeTitles = {
      'Granada': {
        oeste: { es: 'Ruta Oeste', en: 'West Route' },
        este: { es: 'Ruta Este', en: 'East Route' }
      },
      'Matagalpa': {
        general: { es: 'Ruta Turistica de Matagalpa', en: 'Tourist Route of Matagalpa' },
        raices: { es: 'Circuito Creativo Raices Vivas de Matagalpa', en: 'Living Roots Creative Circuit of Matagalpa' }
      },
      'Chontales': {
        general: { es: 'Ruta Turistica de Chontales', en: 'Tourist Route of Chontales' },
        esplendor: { es: 'Circuito Creativo Esplendor Precolombino y Aprendizaje Ancestral', en: 'Creative Circuit Pre-Columbian Splendor and Ancestral Learning' }
      },
      'Esteli': {
        general: { es: 'Ruta Turistica de Esteli', en: 'Tourist Route of Esteli' },
        raices: { es: 'Circuito Creativo Raices y Rutas de Esteli', en: 'Creative Circuit Roots and Routes of Esteli' }
      },
      'Managua': {
        natural: { es: 'Ruta Natural', en: 'Nature Route' },
        gastronomica: { es: 'Ruta Gastronomica', en: 'Gastronomic Route' },
        historica: { es: 'Ruta Historica - Patrimonial', en: 'Historic Heritage Route' },
        cultural: { es: 'Ruta Cultural', en: 'Cultural Route' },
        recreativa: { es: 'Ruta Recreativa y Esparcimiento', en: 'Recreation and Leisure Route' }
      },
      'Masaya': {
        circuito: { es: 'Circuito Creativo Artesanias y Arte Popular', en: 'Creative Circuit Crafts and Folk Art' },
        manos: { es: 'Circuito Creativo Manos Creativas', en: 'Creative Hands Circuit' }
      },
      'Leon': {
        dariano: { es: 'Circuito Creativo Dariano', en: 'Darian Creative Circuit' }
      },
      'San Juan de Oriente': {
        tierraviva: { es: 'Circuito Creativo Tierra Viva', en: 'Tierra Viva Creative Circuit' }
      },
      'Nagarote': {
        patrimonial: { es: 'Circuito Creativo Patrimonial Nagrandano', en: 'Nagarote Heritage Creative Circuit' }
      },
      'Bluefields': {
        paseo: { es: 'Circuito Creativo Historia y Cultura en el Paseo de la Autonomia', en: 'Creative Circuit History and Culture on the Autonomy Promenade' }
      }
    };

    function getRouteLabel(depName, key) {
      var m = routeTitles[depName] && routeTitles[depName][key];
      if (m) return tr(m.es, m.en);
      return tr('Ruta ' + key.charAt(0).toUpperCase() + key.slice(1), 'Route ' + key.charAt(0).toUpperCase() + key.slice(1));
    }

    function openRouteSelPanel(depName) {
      var data = tourismData[depName];
      if (!data || Array.isArray(data)) return;
      document.getElementById('rs-title').textContent = depName + ' - ' + tr('Selecciona una ruta', 'Select a route');
      document.getElementById('rs-sub').textContent = tr('Elige la ruta turistica que deseas recorrer', 'Choose the tourist route you want to take');

      var listHtml = '';
      for (var key in data) {
        var stops = data[key];
        var label = getRouteLabel(depName, key);
        listHtml += '<div class="nc-rs-card" data-route="' + key + '">' +
          '<div class="nc-rs-card-body">' +
            '<div class="nc-rs-card-name">' + label + '</div>' +
            '<div class="nc-rs-card-count">' + stops.length + ' ' + tr('paradas', 'stops') + '</div>' +
          '</div>' +
          '<button class="nc-rs-custom-btn" data-route-custom="' + key + '">' + tr('Mi ruta', 'My route') + '</button>' +
          '<span class="nc-rs-card-arrow">&#8250;</span>' +
        '</div>';
      }
      document.getElementById('rs-body').innerHTML = listHtml;

      document.getElementById('rs-body').querySelectorAll('.nc-rs-card').forEach(function(card) {
        card.onclick = function() {
          var key = card.getAttribute('data-route');
          document.getElementById('route-sel-panel').classList.remove('show');
          buildTourismRoute(depName, data[key]);
        };
      });

      document.getElementById('rs-body').querySelectorAll('.nc-rs-custom-btn').forEach(function(btn) {
        btn.onclick = function(e) {
          e.stopPropagation();
          var key = btn.getAttribute('data-route-custom');
          document.getElementById('route-sel-panel').classList.remove('show');
          openRoutePicker(depName, data[key]);
        };
      });

      document.getElementById('rs-close').onclick = function() {
        document.getElementById('route-sel-panel').classList.remove('show');
      };

      document.getElementById('route-sel-panel').classList.add('show');
    }

    function openRoutePicker(depName, stops) {
      stops = stops || tourismData[depName];
      if (!stops || !Array.isArray(stops) || !stops.length) return;
      currentTourStops = stops;
      pickerSelected = {};

      document.getElementById('rp-title').textContent = depName + ' - ' + tr('Mi ruta', 'My route');
      document.getElementById('rp-sub').textContent = tr('Elige las paradas a visitar', 'Choose the stops to visit') + ' (' + stops.length + ' ' + tr('disponibles', 'available') + ')';

      var listHtml = '';
      stops.forEach(function(s, i) {
        listHtml += '<div class="nc-rp-item" data-idx="' + i + '">' +
          '<div class="nc-rp-check"></div>' +
          '<div class="nc-rp-name">' + (i + 1) + '. ' + s.name + '</div>' +
        '</div>';
      });
      document.getElementById('rp-list').innerHTML = listHtml;

      document.getElementById('rp-list').querySelectorAll('.nc-rp-item').forEach(function(item) {
        item.onclick = function() {
          var idx = parseInt(item.getAttribute('data-idx'));
          pickerSelected[idx] = !pickerSelected[idx];
          item.classList.toggle('selected', pickerSelected[idx]);
          var check = item.querySelector('.nc-rp-check');
          check.textContent = pickerSelected[idx] ? '\u2713' : '';
        };
      });

      document.getElementById('rp-close').onclick = function() {
        document.getElementById('route-pick-panel').classList.remove('show');
      };

      document.getElementById('rp-confirm').onclick = function() {
        var chosen = [];
        for (var key in pickerSelected) {
          if (pickerSelected[key]) chosen.push(stops[parseInt(key)]);
        }
        chosen = chosen.sort(function(a, b) { return stops.indexOf(a) - stops.indexOf(b); });
        document.getElementById('route-pick-panel').classList.remove('show');
        if (chosen.length >= 2) {
          buildTourismRoute(depName, chosen);
        } else if (chosen.length === 1) {
          buildTourismRoute(depName, chosen);
        } else {
          return;
        }
      };

      document.getElementById('route-pick-panel').classList.add('show');
    }

    function buildTourismRoute(depName, stops) {
      clearTourism();
      document.getElementById('route-pick-panel').classList.remove('show');
      if (!stops || !stops.length) return;
      var dep = departamentos.find(function(d) { return d.name === depName; });
      var color = dep ? dep.color : '#69B6E6';
      tourCurrentDep = depName;
      tourActiveStops = stops;
      modeLocked = true;
      focusedDep = null;

      document.getElementById('tour-title').textContent = depName + ' - ' + tr('Ruta Turistica', 'Tourist Route');

      var allPoints = [];
      if (userLat && userLng) { allPoints.push([userLat, userLng]); }
      stops.forEach(function(s) { allPoints.push([s.lat, s.lng]); });

      stops.forEach(function(s, i) {
        var photo = ((s.fotos && s.fotos.length ? s.fotos[0] : '') || '');
        var imgIcon = L.divIcon({
          className: '',
          html: photo
            ? '<div class="nc-tour-marker"><img src="' + photo + '" alt="' + s.name + '" /></div>'
            : '<div class="nc-tour-marker">' + (i + 1) + '</div>',
          iconSize: [36, 36], iconAnchor: [18, 18]
        });
        var m = L.marker([s.lat, s.lng], { icon: imgIcon }).addTo(map);
        (function(idx) {
          m.on('click', function() {
            updateTourPanel(stops, idx);
            showTourStopPopup(stops[idx], idx, stops.length, color);
          });
        })(i);
        tourMarkers.push(m);
      });

      if (allPoints.length >= 2) {
        var coordsStr = allPoints.map(function(p) { return p[1] + ',' + p[0]; }).join(';');
        var url = 'https://router.project-osrm.org/route/v1/driving/' + coordsStr + '?overview=full&geometries=geojson';
        fetch(url).then(function(r) { return r.json(); }).then(function(data) {
          if (data.routes && data.routes.length) {
            var routeCoords = data.routes[0].geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
            tourOsrmCoords = routeCoords;
            activeRouteCoords = routeCoords;
            tourPolyline = L.polyline(routeCoords, {
              color: color, weight: 3.5, opacity: 0.85,
              lineCap: 'round', lineJoin: 'round'
            }).addTo(map);
          } else {
            activeRouteCoords = allPoints;
            tourPolyline = L.polyline(allPoints, {
              color: color, weight: 3, opacity: 0.8, dashArray: '8, 6'
            }).addTo(map);
          }
          map.fitBounds(tourPolyline.getBounds(), { padding: [60, 60] });
        }).catch(function() {
          activeRouteCoords = allPoints;
          tourPolyline = L.polyline(allPoints, {
            color: color, weight: 3, opacity: 0.8, dashArray: '8, 6'
          }).addTo(map);
          map.fitBounds(tourPolyline.getBounds(), { padding: [60, 60] });
        });
      } else {
        activeRouteCoords = allPoints;
        tourPolyline = L.polyline(allPoints, {
          color: color, weight: 3, opacity: 0.8, dashArray: '8, 6'
        }).addTo(map);
        map.fitBounds(tourPolyline.getBounds(), { padding: [60, 60] });
      }

      updateTourPanel(stops, 0);
      document.getElementById('tour-panel').classList.add('show');
      document.getElementById('tour-close').onclick = function() {
        clearTourism();
        map.closePopup();
        unfocusAll();
      };
      document.getElementById('tour-header').onclick = function(e) {
        if (e && e.target && e.target.id === 'tour-close') return;
        toggleTourPanelMin();
      };
      document.getElementById('tour-back').onclick = function() {
        clearTourism();
        map.closePopup();
        unfocusAll();
        map.setView([${center}], 7);
      };
      document.getElementById('tour-start').onclick = function() { startTourismNav(depName); };
      document.getElementById('tour-prev').onclick = function() {
        var cur = parseInt(document.getElementById('tour-num').textContent.match(/\\d+/)[0]) - 1;
        if (cur > 0) {
          updateTourPanel(stops, cur - 1);
          showTourStopPopup(stops[cur - 1], cur - 1, stops.length, color);
        }
      };
      document.getElementById('tour-next').onclick = function() {
        var cur = parseInt(document.getElementById('tour-num').textContent.match(/\\d+/)[0]) - 1;
        if (cur < stops.length - 1) {
          updateTourPanel(stops, cur + 1);
          showTourStopPopup(stops[cur + 1], cur + 1, stops.length, color);
        }
      };
    }

    window.flyToStop = function(i) {
      if (!tourCurrentDep) return;
      var stops = tourActiveStops || tourismData[tourCurrentDep];
      if (!stops || !stops[i]) return;
      var dep = departamentos.find(function(d) { return d.name === tourCurrentDep; });
      var color = dep ? dep.color : '#69B6E6';
      updateTourPanel(stops, i);
      showTourStopPopup(stops[i], i, stops.length, color);
    };

    function startTourismNav(depName) {
      var stops = tourActiveStops || tourismData[depName];
      if (!stops || stops.length < 1) return;
      tourActive = true;

      var dep = departamentos.find(function(d) { return d.name === depName; });
      var color = dep ? dep.color : '#69B6E6';

      document.getElementById('tour-start').style.display = 'none';
      var tstop = document.getElementById('tour-stop-btn');
      tstop.style.display = 'block';
      tstop.classList.add('show');
      tstop.onclick = function() { stopTourismNav(); };

      followMode = true;
      modeLocked = true;
      lastReroute = Date.now();
      if (userLat && userLng) {
        map.setView([userLat, userLng], Math.max(map.getZoom(), 16));
      } else {
        getUsersLocation();
      }

      showTourStopPopup(stops[0], 0, stops.length, color);
      updateTourPanel(stops, 0);
    }

    function stopTourismNav() {
      tourActive = false;
      followMode = false;
      modeLocked = false;
      document.getElementById('tour-start').style.display = '';
      var tstop = document.getElementById('tour-stop-btn');
      tstop.style.display = 'none';
      tstop.classList.remove('show');
      var tp = document.getElementById('tour-panel');
      if (tp) tp.classList.remove('minimized');
    }

    function minimizeTourPanel() {
      var tp = document.getElementById('tour-panel');
      if (!tp || !tp.classList.contains('show') || tp.classList.contains('minimized')) return;
      tp.classList.add('minimized');
    }

    function restoreTourPanel() {
      var tp = document.getElementById('tour-panel');
      if (tp) tp.classList.remove('minimized');
    }

    function toggleTourPanelMin() {
      var tp = document.getElementById('tour-panel');
      if (!tp || !tp.classList.contains('show')) return;
      if (tp.classList.contains('minimized')) restoreTourPanel();
      else minimizeTourPanel();
    }

    map.on('click', function(e) {
      var t = e.originalEvent && e.originalEvent.target;
      var node = t && t.nodeName ? t.nodeName.toLowerCase() : '';
      if (node === 'path' || node === 'img' || node === 'svg' || node === 'a') return;
      if (t && t.closest && t.closest('.leaflet-marker-icon, .leaflet-interactive, .leaflet-control, .leaflet-popup, .leaflet-control-container')) return;
      minimizeTourPanel();
    });

    map.on('popupclose', function() {
      clearTimeout(popupTimer);
      var tp = document.getElementById('tour-panel');
      var tourVisible = tp && tp.classList.contains('show');
      var bv = document.getElementById('biz-view');
      var bizOpen = bv && bv.classList.contains('show');
      if (followMode || tourActive || tourVisible || modeLocked || bizOpen) return;
      if (focusedDep || currentDep) {
        unfocusAll();
        clearRoute();
        clearTourism();
        map.setView([${center}], 7);
      }
      currentDep = null;
    });

    map.on('dragstart', function() {
      if (tourActive) { stopTourismNav(); return; }
      if (followMode) stopNavigation();
    });

    map.on('zoomend', function() {
      if (colorsHidden || focusedDep) return;
      var z = map.getZoom();
      departamentos.forEach(function(dep) {
        var polys = (allPolys[dep.name] || []).concat(munPolys[dep.name] || []);
        if (!polys.length) return;
        var baseFill = dep.highlighted ? 0.40 : 0.18;
        if (z >= 10) {
          var fade = Math.max(0.04, baseFill * 0.15);
          polys.forEach(function(p) { p.setStyle({ fillOpacity: fade, opacity: Math.max(0.1, dep.highlighted ? 0.3 : 0.15) }); });
        } else if (z >= 9) {
          var mid = baseFill * 0.5;
          polys.forEach(function(p) { p.setStyle({ fillOpacity: mid, opacity: dep.highlighted ? 0.6 : 0.35 }); });
        } else {
          polys.forEach(function(p) { p.setStyle({ fillOpacity: baseFill, opacity: dep.highlighted ? 0.9 : 0.6 }); });
        }
      });
    });

    var filesToFetch = [];
    departamentos.forEach(function(d) {
      if (filesToFetch.indexOf(d.file) === -1) filesToFetch.push(d.file);
    });

    var allCoords = {};
    Promise.all(filesToFetch.map(function(f) {
      return fetch('https://raw.githubusercontent.com/pacisauctor/geojson-nicaragua/master/' + f + '.geo.json')
        .then(function(r) { return r.json(); })
        .then(function(geo) { allCoords[f] = geo; })
        .catch(function() { allCoords[f] = null; });
    })).then(function() {
      departamentos.forEach(function(dep) {
        var geo = allCoords[dep.file];
        if (!geo) return;
        geo.features.forEach(function(feat) {
          var g = feat.geometry;
          var addPoly = function(rings) {
            var ll = rings[0].map(function(c) { return [c[1], c[0]]; });
            var baseFill = dep.highlighted ? 0.40 : 0.18;
            var hoverFill = dep.highlighted ? 0.65 : 0.35;
            var poly = L.polygon(ll, {
              color: dep.color, fillColor: dep.color,
              fillOpacity: baseFill,
              weight: dep.highlighted ? 2.5 : 1.5,
              opacity: dep.highlighted ? 0.9 : 0.6
            }).addTo(map);

            if (!allPolys[dep.name]) allPolys[dep.name] = [];
            allPolys[dep.name].push(poly);

            if (dep.highlighted && !MUNICIPIOS[dep.name]) {
              L.polygon(ll, {
                color: '#ffffff', weight: 1.6, opacity: 0.55,
                fill: false, interactive: false
              }).addTo(map);
            }

            poly.on('mouseover', function() {
              if (modeLocked) return;
              if (focusedDep && focusedDep !== dep.name) return;
              poly.setStyle({ fillOpacity: hoverFill, weight: 3 });
              poly.bringToFront();
            });
            poly.on('mouseout', function() {
              if (modeLocked) return;
              if (focusedDep && focusedDep !== dep.name) return;
              poly.setStyle({ fillOpacity: baseFill, weight: dep.highlighted ? 2.5 : 1.5 });
            });

            var c = getCentroid(ll);
            if (dep.highlighted && !MUNICIPIOS[dep.name]) {
              var marker = L.marker(c, {
                icon: L.divIcon({
                  className: '',
                  html: '<div class="pin-marker">' + '<div class="pin-name" style="color:#ffffff;">' + dep.name + '</div>' + makePinSvg(dep.color) + '</div>',
                  iconSize: [72, 68], iconAnchor: [36, 68]
                })
              }).addTo(map);

              allPins[dep.name] = marker;

              poly.on('click', function(e) { if (modeLocked) return; openPopup(dep, e.latlng); });
              marker.on('click', function() { if (modeLocked) return; openPopup(dep, c); });
            }
          };
          if (g.type === 'Polygon') { addPoly(g.coordinates); }
          else if (g.type === 'MultiPolygon') { g.coordinates.forEach(addPoly); }
        });
      });
      departamentos.forEach(function(dep) {
        if (allCoords[dep.file] || !dep.highlighted) return;
        if (allPolys[dep.name] && allPolys[dep.name].length) return;
        var c = L.latLng(dep.cLat, dep.cLng);
        addPin(dep, c);
      });
      Object.keys(MUNICIPIOS).forEach(function(name) {
        var dep = departamentos.filter(function(d) { return d.name === name; })[0];
        if (!dep || !dep.highlighted) return;
        drawMunicipio(dep);
      });
      applyCountryClip();
    });

    function addPin(dep, c) {
      var marker = L.marker(c, {
        icon: L.divIcon({
          className: '',
          html: '<div class="pin-marker">' + '<div class="pin-name" style="color:#ffffff;">' + dep.name + '</div>' + makePinSvg(dep.color) + '</div>',
          iconSize: [72, 68], iconAnchor: [36, 68]
        })
      }).addTo(map);
      allPins[dep.name] = marker;
      marker.on('click', function() { if (modeLocked) return; openPopup(dep, c); });
      marker.bindTooltip(dep.name, { permanent: false, direction: 'top', offset: [0, -20], className: 'nc-pin-tooltip' });
      marker.on('mouseover', function() { marker.openTooltip(); });
      marker.on('mouseout', function() { marker.closeTooltip(); });
    }

    function munCentroid(name) {
      var rings = MUNICIPIOS[name];
      if (!rings || !rings.length) return null;
      var lat = 0, lng = 0, n = 0;
      rings.forEach(function(r) { r.forEach(function(pt) { lat += pt[0]; lng += pt[1]; n++; }); });
      return L.latLng(lat / n, lng / n);
    }

    function drawMunicipio(dep) {
      var rings = MUNICIPIOS[dep.name];
      if (!rings) return;
      if (!munPolys[dep.name]) munPolys[dep.name] = [];
      var baseFill = dep.highlighted ? 0.55 : 0.3;
      rings.forEach(function(ring) {
        var ll = ring.map(function(pt) { return [pt[0], pt[1]]; });
        var poly = L.polygon(ll, {
          color: dep.color, fillColor: dep.color,
          fillOpacity: baseFill,
          weight: 3, opacity: 1
        }).addTo(map);
        poly.bringToFront();
        munPolys[dep.name].push(poly);
        poly.on('mouseover', function() {
          if (modeLocked) return;
          if (focusedDep && focusedDep !== dep.name) return;
          poly.setStyle({ fillOpacity: 0.8, weight: 4 });
          poly.bringToFront();
        });
        poly.on('mouseout', function() {
          if (modeLocked) return;
          if (focusedDep && focusedDep !== dep.name) return;
          poly.setStyle({ fillOpacity: baseFill, weight: 3 });
        });
        poly.on('click', function(e) { if (modeLocked) return; openPopup(dep, e.latlng); });
      });
      var c = munCentroid(dep.name);
      if (c) {
        if (allPins[dep.name]) { map.removeLayer(allPins[dep.name]); allPins[dep.name] = null; }
        var marker = L.marker(c, {
          icon: L.divIcon({
            className: '',
            html: '<div class="pin-marker">' + '<div class="pin-name" style="color:#ffffff;">' + dep.name + '</div>' + makePinSvg(dep.color) + '</div>',
            iconSize: [72, 68], iconAnchor: [36, 68]
          })
        }).addTo(map);
        allPins[dep.name] = marker;
        marker.on('click', function() { if (modeLocked) return; openPopup(dep, c); });
        marker.bindTooltip(dep.name, { permanent: false, direction: 'top', offset: [0, -20], className: 'nc-pin-tooltip' });
        marker.on('mouseover', function() { marker.openTooltip(); });
        marker.on('mouseout', function() { marker.closeTooltip(); });
      }
    }
  </script>
</body>
</html>`;

function getMapApiBase() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8080`;
  }
  try {
    const Constants = require('expo-constants').default;
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      if (host) return `http://${host}:8080`;
    }
  } catch {}
  return 'http://localhost:8080';
}

function WebMap({ onReady, resetToken }: { onReady?: () => void; resetToken?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { signOut } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const [cityImages, setCityImages] = useState<Record<string, string>>({});
  const [mapBg, setMapBg] = useState('');
  const [tourImages, setTourImages] = useState<Record<string, string[]>>({});

  useEffect(() => {
    loadCityImagesBase64().then(setCityImages);
    loadMapBackground().then(setMapBg);
    loadTourImagesBase64().then(setTourImages);
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const iframe = document.createElement('iframe');
    iframe.srcdoc = leafletHtml(MAP_CENTER, getMapApiBase(), lang, cityImages, mapBg, tourImages);
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.title = 'Nicaragua Map';
    iframeRef.current = iframe;
    ref.current.appendChild(iframe);
    onReady?.();

    const handler = (e: MessageEvent) => {
      if (e.data === 'logout') {
        signOut().then(() => router.replace('/(auth)/login'));
      }
    };
    window.addEventListener('message', handler);

    return () => {
      window.removeEventListener('message', handler);
      iframeRef.current = null;
      ref.current?.removeChild(iframe);
    };
  }, [lang, cityImages, mapBg, tourImages, onReady]);

  useEffect(() => {
    if (!resetToken) return;
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ type: 'reset' }), '*');
  }, [resetToken]);

  return <div ref={ref} style={{ width: '100%', height: '100%', margin: 0, padding: 0 }} />;
}

function NativeMap({ onReady, resetToken }: { onReady?: () => void; resetToken?: number }) {
  const { t, lang } = useLang();
  const webViewRef = useRef<any>(null);
  const { signOut } = useAuth();
  const router = useRouter();
  const locationRef = useRef<{ lat: number; lng: number } | null>(null);
  const loadedRef = useRef(false);
  const [cityImages, setCityImages] = useState<Record<string, string>>({});
  const [mapBg, setMapBg] = useState('');
  const [tourImages, setTourImages] = useState<Record<string, string[]>>({});
  const [WebView] = useState<any>(() => {
    try {
      return require('react-native-webview').WebView;
    } catch {
      return null;
    }
  });
  const [Location] = useState<any>(() => {
    try {
      return require('expo-location');
    } catch {
      return null;
    }
  });

  const sendLocation = () => {
    const loc = locationRef.current;
    if (loc && loadedRef.current) {
      webViewRef.current?.postMessage(JSON.stringify({ type: 'location', lat: loc.lat, lng: loc.lng }));
    }
  };

  useEffect(() => {
    loadCityImagesBase64().then(setCityImages);
    loadMapBackground().then(setMapBg);
    loadTourImagesBase64().then(setTourImages);
  }, []);

  useEffect(() => {
    if (!Location) return;
    let mounted = true;
    let subscription: any = null;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!mounted || status !== 'granted') return;
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        locationRef.current = { lat: location.coords.latitude, lng: location.coords.longitude };
        sendLocation();
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 2000, distanceInterval: 5 },
          (newLocation: any) => {
            if (!mounted) return;
            locationRef.current = { lat: newLocation.coords.latitude, lng: newLocation.coords.longitude };
            sendLocation();
          }
        );
      } catch (error) {
        console.warn('No se pudo obtener la ubicacion:', error);
      }
    })();
    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, [Location]);

  useEffect(() => {
    if (!resetToken) return;
    if (loadedRef.current) {
      webViewRef.current?.injectJavaScript?.('window.resetToHome && window.resetToHome();');
    }
  }, [resetToken]);

  if (!WebView || !Location) {
    return (
      <View style={styles.locationFallback}>
        <Text style={styles.locationFallbackTitle}>{t.locationUnavailableTitle}</Text>
        <Text style={styles.locationFallbackMessage}>{t.locationUnavailableMessage}</Text>
      </View>
    );
  }

  return (
    <WebView
      ref={webViewRef}
      key={lang}
      style={{ flex: 1 }}
      originWhitelist={['*']}
      source={{ html: leafletHtml(MAP_CENTER, getMapApiBase(), lang, cityImages, mapBg, tourImages) }}
      javaScriptEnabled
      scrollEnabled={false}
      onLoadEnd={() => {
        loadedRef.current = true;
        sendLocation();
      }}
      onMessage={(e: any) => {
        if (e.nativeEvent.data === 'logout') {
          signOut().then(() => router.replace('/(auth)/login'));
        }
      }}
    />
  );
}

export default function NicaraguaMap({ onReady, resetToken }: { onReady?: () => void; resetToken?: number }) {
  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <WebMap onReady={onReady} resetToken={resetToken} />
      ) : (
        <NativeMap onReady={onReady} resetToken={resetToken} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  locationFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0B1F3A',
  },
  locationFallbackTitle: {
    color: '#69B6E6',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  locationFallbackMessage: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
