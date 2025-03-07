-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 07-03-2025 a las 04:50:54
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `viadiseno_inscripciones`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumno`
--

CREATE TABLE `alumno` (
  `ivd_id` int(11) NOT NULL,
  `semestre` int(11) NOT NULL,
  `regular` tinyint(1) NOT NULL,
  `plan_estudio_id` varchar(50) NOT NULL,
  `inscripcion_completada` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `alumno`
--

INSERT INTO `alumno` (`ivd_id`, `semestre`, `regular`, `plan_estudio_id`, `inscripcion_completada`) VALUES
(21, 1, 1, '1', 1),
(22, 2, 1, '2', 1),
(23, 3, 0, '1', 1),
(24, 4, 1, '2', 0),
(25, 5, 1, '1', 0),
(26, 6, 0, '2', 1),
(27, 7, 1, '1', 0),
(28, 8, 1, '2', 0),
(29, 1, 0, '1', 1),
(30, 2, 1, '2', 0),
(31, 3, 1, '1', 1),
(32, 4, 0, '2', 1),
(33, 5, 1, '1', 0),
(34, 6, 1, '2', 1),
(35, 7, 0, '1', 0),
(36, 8, 1, '2', 0),
(37, 1, 1, '1', 0),
(38, 2, 1, '2', 1),
(39, 3, 0, '1', 1),
(40, 4, 1, '2', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bloque_tiempo`
--

CREATE TABLE `bloque_tiempo` (
  `bloque_tiempo_id` varchar(50) NOT NULL,
  `dia` varchar(20) NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `bloque_tiempo`
--

INSERT INTO `bloque_tiempo` (`bloque_tiempo_id`, `dia`, `hora_inicio`, `hora_fin`) VALUES
('JUE_07:00', 'Jueves', '07:00:00', '07:30:00'),
('JUE_07:30', 'Jueves', '07:30:00', '08:00:00'),
('JUE_08:00', 'Jueves', '08:00:00', '08:30:00'),
('JUE_08:30', 'Jueves', '08:30:00', '09:00:00'),
('JUE_09:00', 'Jueves', '09:00:00', '09:30:00'),
('JUE_09:30', 'Jueves', '09:30:00', '10:00:00'),
('JUE_10:00', 'Jueves', '10:00:00', '10:30:00'),
('JUE_10:30', 'Jueves', '10:30:00', '11:00:00'),
('JUE_11:00', 'Jueves', '11:00:00', '11:30:00'),
('JUE_11:30', 'Jueves', '11:30:00', '12:00:00'),
('JUE_12:00', 'Jueves', '12:00:00', '12:30:00'),
('JUE_12:30', 'Jueves', '12:30:00', '13:00:00'),
('JUE_13:00', 'Jueves', '13:00:00', '13:30:00'),
('JUE_13:30', 'Jueves', '13:30:00', '14:00:00'),
('JUE_14:00', 'Jueves', '14:00:00', '14:30:00'),
('JUE_14:30', 'Jueves', '14:30:00', '15:00:00'),
('JUE_15:00', 'Jueves', '15:00:00', '15:30:00'),
('JUE_15:30', 'Jueves', '15:30:00', '16:00:00'),
('JUE_16:00', 'Jueves', '16:00:00', '16:30:00'),
('JUE_16:30', 'Jueves', '16:30:00', '17:00:00'),
('JUE_17:00', 'Jueves', '17:00:00', '17:30:00'),
('JUE_17:30', 'Jueves', '17:30:00', '18:00:00'),
('JUE_18:00', 'Jueves', '18:00:00', '18:30:00'),
('JUE_18:30', 'Jueves', '18:30:00', '19:00:00'),
('LUN_07:00', 'Lunes', '07:00:00', '07:30:00'),
('LUN_07:30', 'Lunes', '07:30:00', '08:00:00'),
('LUN_08:00', 'Lunes', '08:00:00', '08:30:00'),
('LUN_08:30', 'Lunes', '08:30:00', '09:00:00'),
('LUN_09:00', 'Lunes', '09:00:00', '09:30:00'),
('LUN_09:30', 'Lunes', '09:30:00', '10:00:00'),
('LUN_10:00', 'Lunes', '10:00:00', '10:30:00'),
('LUN_10:30', 'Lunes', '10:30:00', '11:00:00'),
('LUN_11:00', 'Lunes', '11:00:00', '11:30:00'),
('LUN_11:30', 'Lunes', '11:30:00', '12:00:00'),
('LUN_12:00', 'Lunes', '12:00:00', '12:30:00'),
('LUN_12:30', 'Lunes', '12:30:00', '13:00:00'),
('LUN_13:00', 'Lunes', '13:00:00', '13:30:00'),
('LUN_13:30', 'Lunes', '13:30:00', '14:00:00'),
('LUN_14:00', 'Lunes', '14:00:00', '14:30:00'),
('LUN_14:30', 'Lunes', '14:30:00', '15:00:00'),
('LUN_15:00', 'Lunes', '15:00:00', '15:30:00'),
('LUN_15:30', 'Lunes', '15:30:00', '16:00:00'),
('LUN_16:00', 'Lunes', '16:00:00', '16:30:00'),
('LUN_16:30', 'Lunes', '16:30:00', '17:00:00'),
('LUN_17:00', 'Lunes', '17:00:00', '17:30:00'),
('LUN_17:30', 'Lunes', '17:30:00', '18:00:00'),
('LUN_18:00', 'Lunes', '18:00:00', '18:30:00'),
('LUN_18:30', 'Lunes', '18:30:00', '19:00:00'),
('MAR_07:00', 'Martes', '07:00:00', '07:30:00'),
('MAR_07:30', 'Martes', '07:30:00', '08:00:00'),
('MAR_08:00', 'Martes', '08:00:00', '08:30:00'),
('MAR_08:30', 'Martes', '08:30:00', '09:00:00'),
('MAR_09:00', 'Martes', '09:00:00', '09:30:00'),
('MAR_09:30', 'Martes', '09:30:00', '10:00:00'),
('MAR_10:00', 'Martes', '10:00:00', '10:30:00'),
('MAR_10:30', 'Martes', '10:30:00', '11:00:00'),
('MAR_11:00', 'Martes', '11:00:00', '11:30:00'),
('MAR_11:30', 'Martes', '11:30:00', '12:00:00'),
('MAR_12:00', 'Martes', '12:00:00', '12:30:00'),
('MAR_12:30', 'Martes', '12:30:00', '13:00:00'),
('MAR_13:00', 'Martes', '13:00:00', '13:30:00'),
('MAR_13:30', 'Martes', '13:30:00', '14:00:00'),
('MAR_14:00', 'Martes', '14:00:00', '14:30:00'),
('MAR_14:30', 'Martes', '14:30:00', '15:00:00'),
('MAR_15:00', 'Martes', '15:00:00', '15:30:00'),
('MAR_15:30', 'Martes', '15:30:00', '16:00:00'),
('MAR_16:00', 'Martes', '16:00:00', '16:30:00'),
('MAR_16:30', 'Martes', '16:30:00', '17:00:00'),
('MAR_17:00', 'Martes', '17:00:00', '17:30:00'),
('MAR_17:30', 'Martes', '17:30:00', '18:00:00'),
('MAR_18:00', 'Martes', '18:00:00', '18:30:00'),
('MAR_18:30', 'Martes', '18:30:00', '19:00:00'),
('MIE_07:00', 'Miércoles', '07:00:00', '07:30:00'),
('MIE_07:30', 'Miércoles', '07:30:00', '08:00:00'),
('MIE_08:00', 'Miércoles', '08:00:00', '08:30:00'),
('MIE_08:30', 'Miércoles', '08:30:00', '09:00:00'),
('MIE_09:00', 'Miércoles', '09:00:00', '09:30:00'),
('MIE_09:30', 'Miércoles', '09:30:00', '10:00:00'),
('MIE_10:00', 'Miércoles', '10:00:00', '10:30:00'),
('MIE_10:30', 'Miércoles', '10:30:00', '11:00:00'),
('MIE_11:00', 'Miércoles', '11:00:00', '11:30:00'),
('MIE_11:30', 'Miércoles', '11:30:00', '12:00:00'),
('MIE_12:00', 'Miércoles', '12:00:00', '12:30:00'),
('MIE_12:30', 'Miércoles', '12:30:00', '13:00:00'),
('MIE_13:00', 'Miércoles', '13:00:00', '13:30:00'),
('MIE_13:30', 'Miércoles', '13:30:00', '14:00:00'),
('MIE_14:00', 'Miércoles', '14:00:00', '14:30:00'),
('MIE_14:30', 'Miércoles', '14:30:00', '15:00:00'),
('MIE_15:00', 'Miércoles', '15:00:00', '15:30:00'),
('MIE_15:30', 'Miércoles', '15:30:00', '16:00:00'),
('MIE_16:00', 'Miércoles', '16:00:00', '16:30:00'),
('MIE_16:30', 'Miércoles', '16:30:00', '17:00:00'),
('MIE_17:00', 'Miércoles', '17:00:00', '17:30:00'),
('MIE_17:30', 'Miércoles', '17:30:00', '18:00:00'),
('MIE_18:00', 'Miércoles', '18:00:00', '18:30:00'),
('MIE_18:30', 'Miércoles', '18:30:00', '19:00:00'),
('VIE_07:00', 'Viernes', '07:00:00', '07:30:00'),
('VIE_07:30', 'Viernes', '07:30:00', '08:00:00'),
('VIE_08:00', 'Viernes', '08:00:00', '08:30:00'),
('VIE_08:30', 'Viernes', '08:30:00', '09:00:00'),
('VIE_09:00', 'Viernes', '09:00:00', '09:30:00'),
('VIE_09:30', 'Viernes', '09:30:00', '10:00:00'),
('VIE_10:00', 'Viernes', '10:00:00', '10:30:00'),
('VIE_10:30', 'Viernes', '10:30:00', '11:00:00'),
('VIE_11:00', 'Viernes', '11:00:00', '11:30:00'),
('VIE_11:30', 'Viernes', '11:30:00', '12:00:00'),
('VIE_12:00', 'Viernes', '12:00:00', '12:30:00'),
('VIE_12:30', 'Viernes', '12:30:00', '13:00:00'),
('VIE_13:00', 'Viernes', '13:00:00', '13:30:00'),
('VIE_13:30', 'Viernes', '13:30:00', '14:00:00'),
('VIE_14:00', 'Viernes', '14:00:00', '14:30:00'),
('VIE_14:30', 'Viernes', '14:30:00', '15:00:00'),
('VIE_15:00', 'Viernes', '15:00:00', '15:30:00'),
('VIE_15:30', 'Viernes', '15:30:00', '16:00:00'),
('VIE_16:00', 'Viernes', '16:00:00', '16:30:00'),
('VIE_16:30', 'Viernes', '16:30:00', '17:00:00'),
('VIE_17:00', 'Viernes', '17:00:00', '17:30:00'),
('VIE_17:30', 'Viernes', '17:30:00', '18:00:00'),
('VIE_18:00', 'Viernes', '18:00:00', '18:30:00'),
('VIE_18:30', 'Viernes', '18:30:00', '19:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `campus`
--

CREATE TABLE `campus` (
  `campus_id` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `campus`
--

INSERT INTO `campus` (`campus_id`, `nombre`) VALUES
('1', 'Campus Norte'),
('2', 'Campus Sur');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrera`
--

CREATE TABLE `carrera` (
  `carrera_id` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `carrera`
--

INSERT INTO `carrera` (`carrera_id`, `nombre`) VALUES
('1', 'Diseño de la Moda e Industria del Vestido'),
('2', 'Diseño y Arquitectura de Interiores');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ciclo_escolar`
--

CREATE TABLE `ciclo_escolar` (
  `ciclo_escolar_id` varchar(50) NOT NULL,
  `code` varchar(20) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ciclo_escolar`
--

INSERT INTO `ciclo_escolar` (`ciclo_escolar_id`, `code`, `fecha_inicio`, `fecha_fin`) VALUES
('2018', '2018-2019', '2018-08-01', '2019-07-31'),
('2019', '2019-2020', '2019-08-01', '2020-07-31'),
('2020', '2020-2021', '2020-08-01', '2021-07-31'),
('2021', '2021-2022', '2021-08-01', '2022-07-31'),
('2022', '2022-2023', '2022-08-01', '2023-07-31'),
('2023', '2023-2024', '2023-08-01', '2024-07-31'),
('2024', '2024-2025', '2024-08-01', '2025-07-31'),
('2025', '2025-2026', '2025-08-01', '2026-07-31'),
('2026', '2026-2027', '2026-08-01', '2027-07-31'),
('2027', '2027-2028', '2027-08-01', '2028-07-31');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `coordinador`
--

CREATE TABLE `coordinador` (
  `ivd_id` int(11) NOT NULL,
  `carrera_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `coordinador`
--

INSERT INTO `coordinador` (`ivd_id`, `carrera_id`) VALUES
(1, '1'),
(2, '2');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupo`
--

CREATE TABLE `grupo` (
  `grupo_id` varchar(50) NOT NULL,
  `materia_id` varchar(50) NOT NULL,
  `profesor_id` varchar(50) NOT NULL,
  `salon_id` varchar(50) NOT NULL,
  `ciclo_escolar_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `grupo`
--

INSERT INTO `grupo` (`grupo_id`, `materia_id`, `profesor_id`, `salon_id`, `ciclo_escolar_id`) VALUES
('1', '1', '1', '5', '2024'),
('10', '10', '10', '14', '2024'),
('11', '11', '11', '15', '2024'),
('12', '12', '12', '16', '2024'),
('13', '13', '13', '17', '2024'),
('14', '14', '14', '18', '2024'),
('15', '15', '15', '19', '2024'),
('16', '16', '16', '20', '2024'),
('17', '17', '17', '1', '2024'),
('18', '18', '18', '2', '2024'),
('19', '19', '19', '3', '2024'),
('2', '2', '2', '6', '2024'),
('20', '20', '20', '4', '2024'),
('21', '5', '1', '10', '2025'),
('3', '3', '3', '7', '2024'),
('4', '4', '4', '8', '2024'),
('5', '5', '5', '9', '2024'),
('6', '6', '6', '10', '2024'),
('7', '7', '7', '11', '2024'),
('8', '8', '8', '12', '2024'),
('9', '9', '9', '13', '2024');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupo_bloque_tiempo`
--

CREATE TABLE `grupo_bloque_tiempo` (
  `grupo_id` varchar(50) NOT NULL,
  `horario_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `grupo_bloque_tiempo`
--

INSERT INTO `grupo_bloque_tiempo` (`grupo_id`, `horario_id`) VALUES
('1', 'LUN_07:00'),
('1', 'LUN_07:30'),
('10', 'JUE_07:00'),
('10', 'JUE_07:30'),
('11', 'JUE_08:00'),
('11', 'JUE_08:30'),
('12', 'JUE_09:00'),
('12', 'JUE_09:30'),
('13', 'VIE_07:00'),
('13', 'VIE_07:30'),
('14', 'VIE_08:00'),
('14', 'VIE_08:30'),
('15', 'VIE_09:00'),
('15', 'VIE_09:30'),
('16', 'LUN_10:00'),
('16', 'LUN_10:30'),
('17', 'MAR_10:00'),
('17', 'MAR_10:30'),
('18', 'MIE_10:00'),
('18', 'MIE_10:30'),
('19', 'JUE_10:00'),
('19', 'JUE_10:30'),
('2', 'LUN_08:00'),
('2', 'LUN_08:30'),
('20', 'VIE_10:00'),
('20', 'VIE_10:30'),
('21', 'LUN_13:00'),
('21', 'LUN_13:30'),
('21', 'LUN_14:00'),
('21', 'LUN_14:30'),
('3', 'LUN_09:00'),
('3', 'LUN_09:30'),
('4', 'MAR_07:00'),
('4', 'MAR_07:30'),
('5', 'MAR_08:00'),
('5', 'MAR_08:30'),
('6', 'MAR_09:00'),
('6', 'MAR_09:30'),
('7', 'MIE_07:00'),
('7', 'MIE_07:30'),
('8', 'MIE_08:00'),
('8', 'MIE_08:30'),
('9', 'MIE_09:00'),
('9', 'MIE_09:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_academico`
--

CREATE TABLE `historial_academico` (
  `ivd_id` int(11) NOT NULL,
  `materia_id` varchar(50) NOT NULL,
  `ciclo_escolar_id` varchar(50) NOT NULL,
  `aprobado` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historial_academico`
--

INSERT INTO `historial_academico` (`ivd_id`, `materia_id`, `ciclo_escolar_id`, `aprobado`) VALUES
(21, '1', '2023', 1),
(21, '2', '2023', 1),
(21, '3', '2023', 0),
(22, '1', '2023', 1),
(22, '2', '2023', 1),
(22, '3', '2023', 1),
(23, '4', '2023', 1),
(23, '5', '2023', 0),
(23, '6', '2023', 1),
(24, '4', '2023', 1),
(24, '5', '2023', 1),
(24, '6', '2023', 1),
(25, '7', '2024', 0),
(25, '8', '2024', 1),
(25, '9', '2024', 1),
(26, '7', '2024', 1),
(26, '8', '2024', 1),
(26, '9', '2024', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materia`
--

CREATE TABLE `materia` (
  `materia_id` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `creditos` int(11) NOT NULL,
  `horas_profesor` int(11) NOT NULL,
  `tipo_salon` varchar(50) DEFAULT NULL,
  `profesor_id` varchar(50) DEFAULT NULL,
  `abierta` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `materia`
--

INSERT INTO `materia` (`materia_id`, `nombre`, `creditos`, `horas_profesor`, `tipo_salon`, `profesor_id`, `abierta`) VALUES
('1', 'Fundamentos del Diseño', 6, 4, 'Aula Regular', NULL, 0),
('10', 'Gestión de Proyectos de Diseño', 5, 3, 'Aula Regular', NULL, 0),
('11', 'Patronaje y Confección', 6, 4, 'Taller', NULL, 0),
('12', 'Diseño de Espacios Comerciales', 6, 4, 'Aula Regular', NULL, 1),
('13', 'Diseño Sostenible', 5, 3, 'Aula Regular', NULL, 1),
('14', 'Prototipos en Diseño', 6, 4, 'Taller', NULL, 1),
('15', 'Historia del Diseño de Interiores', 4, 3, 'Aula Regular', NULL, 1),
('16', 'Iluminación y Ambientes', 5, 3, 'Aula Regular', NULL, 1),
('17', 'Diseño de Mobiliario', 6, 4, 'Taller', NULL, 0),
('18', 'Visual Merchandising', 5, 3, 'Aula Regular', NULL, 0),
('19', 'Ética y Normatividad en Diseño', 4, 3, 'Aula Regular', NULL, 0),
('2', 'Dibujo Técnico', 5, 3, 'Aula Regular', NULL, 0),
('20', 'Emprendimiento en Diseño', 5, 3, 'Aula Regular', NULL, 0),
('3', 'Historia del Arte', 4, 3, 'Aula Regular', NULL, 0),
('4', 'Teoría del Color', 5, 3, 'Aula Regular', NULL, 1),
('5', 'Materiales y Texturas', 6, 4, 'Taller', '1', 1),
('6', 'Modelado Digital', 6, 4, 'Laboratorio Computo', NULL, 0),
('7', 'Metodología del Diseño', 5, 3, 'Aula Regular', NULL, 1),
('8', 'Análisis de Tendencias', 4, 3, 'Aula Regular', NULL, 0),
('9', 'Ilustración Digital', 6, 4, 'Laboratorio Computo', NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materia_requisito`
--

CREATE TABLE `materia_requisito` (
  `materia_id` varchar(50) NOT NULL,
  `requisito_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `materia_requisito`
--

INSERT INTO `materia_requisito` (`materia_id`, `requisito_id`) VALUES
('11', '5'),
('12', '8'),
('13', '6'),
('14', '11'),
('17', '12'),
('20', '18'),
('4', '1'),
('5', '2'),
('6', '3'),
('9', '7');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plan_estudio`
--

CREATE TABLE `plan_estudio` (
  `plan_estudio_id` varchar(50) NOT NULL,
  `version` varchar(50) NOT NULL,
  `carrera_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `plan_estudio`
--

INSERT INTO `plan_estudio` (`plan_estudio_id`, `version`, `carrera_id`) VALUES
('1', '2020A', '1'),
('2', '2022B', '1'),
('3', '2019A', '2'),
('4', '2021B', '2');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plan_materia`
--

CREATE TABLE `plan_materia` (
  `plan_estudio_id` varchar(50) NOT NULL,
  `materia_id` varchar(50) NOT NULL,
  `semestre` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `plan_materia`
--

INSERT INTO `plan_materia` (`plan_estudio_id`, `materia_id`, `semestre`) VALUES
('1', '1', 1),
('1', '10', 5),
('1', '2', 1),
('1', '3', 1),
('1', '4', 2),
('1', '5', 2),
('1', '6', 3),
('1', '7', 3),
('1', '8', 4),
('1', '9', 4),
('2', '11', 1),
('2', '12', 1),
('2', '13', 2),
('2', '14', 2),
('2', '15', 3),
('2', '16', 3),
('2', '17', 4),
('2', '18', 4),
('2', '19', 5),
('2', '20', 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `profesor`
--

CREATE TABLE `profesor` (
  `profesor_id` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `primer_apellido` varchar(100) NOT NULL,
  `segundo_apellido` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `profesor`
--

INSERT INTO `profesor` (`profesor_id`, `nombre`, `primer_apellido`, `segundo_apellido`) VALUES
('1', 'Juan', 'Pérez', 'López'),
('10', 'Patricia', 'Mendoza', 'Silva'),
('11', 'Fernando', 'Ortega', 'Romero'),
('12', 'Isabel', 'Delgado', 'Navarro'),
('13', 'Hugo', 'Ramos', 'Reyes'),
('14', 'Mónica', 'Fuentes', 'Acosta'),
('15', 'Ricardo', 'Cortés', 'Guerrero'),
('16', 'Gabriela', 'Luna', 'Paredes'),
('17', 'Antonio', 'Molina', 'Salazar'),
('18', 'Clara', 'Ibarra', 'Domínguez'),
('19', 'Javier', 'Suárez', 'Escobar'),
('2', 'María', 'González', 'Ruiz'),
('20', 'Laura', 'Mejía', 'Velázquez'),
('3', 'Carlos', 'Fernández', 'Díaz'),
('4', 'Ana', 'Hernández', 'Martínez'),
('5', 'Luis', 'Torres', 'Sánchez'),
('6', 'Sofía', 'Ramírez', 'Gómez'),
('7', 'David', 'Vargas', 'Ortiz'),
('8', 'Elena', 'Morales', 'Jiménez'),
('9', 'Roberto', 'Castro', 'Álvarez');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `profesor_bloque_tiempo`
--

CREATE TABLE `profesor_bloque_tiempo` (
  `profesor_id` varchar(50) NOT NULL,
  `bloque_tiempo_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `profesor_bloque_tiempo`
--

INSERT INTO `profesor_bloque_tiempo` (`profesor_id`, `bloque_tiempo_id`) VALUES
('1', 'LUN_07:00'),
('1', 'LUN_07:30'),
('1', 'LUN_08:00'),
('1', 'LUN_08:30'),
('1', 'LUN_13:00'),
('1', 'LUN_13:30'),
('1', 'LUN_14:00'),
('1', 'LUN_14:30'),
('10', 'MIE_09:00'),
('10', 'MIE_09:30'),
('10', 'MIE_10:00'),
('10', 'MIE_10:30'),
('11', 'MIE_11:00'),
('11', 'MIE_11:30'),
('11', 'MIE_12:00'),
('11', 'MIE_12:30'),
('12', 'MIE_13:00'),
('12', 'MIE_13:30'),
('12', 'MIE_14:00'),
('12', 'MIE_14:30'),
('13', 'JUE_07:00'),
('13', 'JUE_07:30'),
('13', 'JUE_08:00'),
('13', 'JUE_08:30'),
('14', 'JUE_09:00'),
('14', 'JUE_09:30'),
('14', 'JUE_10:00'),
('14', 'JUE_10:30'),
('15', 'JUE_11:00'),
('15', 'JUE_11:30'),
('15', 'JUE_12:00'),
('15', 'JUE_12:30'),
('16', 'JUE_13:00'),
('16', 'JUE_13:30'),
('16', 'JUE_14:00'),
('16', 'JUE_14:30'),
('17', 'VIE_07:00'),
('17', 'VIE_07:30'),
('17', 'VIE_08:00'),
('17', 'VIE_08:30'),
('18', 'VIE_09:00'),
('18', 'VIE_09:30'),
('18', 'VIE_10:00'),
('18', 'VIE_10:30'),
('19', 'VIE_11:00'),
('19', 'VIE_11:30'),
('19', 'VIE_12:00'),
('19', 'VIE_12:30'),
('2', 'LUN_09:00'),
('2', 'LUN_09:30'),
('2', 'LUN_10:00'),
('2', 'LUN_10:30'),
('20', 'VIE_13:00'),
('20', 'VIE_13:30'),
('20', 'VIE_14:00'),
('20', 'VIE_14:30'),
('3', 'LUN_11:00'),
('3', 'LUN_11:30'),
('3', 'LUN_12:00'),
('3', 'LUN_12:30'),
('4', 'LUN_13:00'),
('4', 'LUN_13:30'),
('4', 'LUN_14:00'),
('4', 'LUN_14:30'),
('5', 'MAR_07:00'),
('5', 'MAR_07:30'),
('5', 'MAR_08:00'),
('5', 'MAR_08:30'),
('6', 'MAR_09:00'),
('6', 'MAR_09:30'),
('6', 'MAR_10:00'),
('6', 'MAR_10:30'),
('7', 'MAR_11:00'),
('7', 'MAR_11:30'),
('7', 'MAR_12:00'),
('7', 'MAR_12:30'),
('8', 'MAR_13:00'),
('8', 'MAR_13:30'),
('8', 'MAR_14:00'),
('8', 'MAR_14:30'),
('9', 'MIE_07:00'),
('9', 'MIE_07:30'),
('9', 'MIE_08:00'),
('9', 'MIE_08:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resultado_inscripcion`
--

CREATE TABLE `resultado_inscripcion` (
  `alumno_id` int(11) NOT NULL,
  `grupo_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `resultado_inscripcion`
--

INSERT INTO `resultado_inscripcion` (`alumno_id`, `grupo_id`) VALUES
(21, '1'),
(21, '2'),
(21, '3'),
(21, '4'),
(21, '5'),
(21, '7'),
(21, '8'),
(22, '10'),
(22, '6'),
(22, '7'),
(22, '8'),
(22, '9'),
(23, '11'),
(23, '12'),
(23, '13'),
(23, '14'),
(23, '15'),
(24, '16'),
(24, '17'),
(24, '18'),
(24, '19'),
(24, '20'),
(25, '1'),
(25, '2'),
(25, '3'),
(25, '4'),
(25, '5'),
(26, '10'),
(26, '6'),
(26, '7'),
(26, '8'),
(26, '9'),
(27, '11'),
(27, '12'),
(27, '13'),
(27, '14'),
(27, '15'),
(28, '16'),
(28, '17'),
(28, '18'),
(28, '19'),
(28, '20'),
(29, '1'),
(29, '2'),
(29, '21'),
(29, '3'),
(29, '4'),
(29, '5'),
(30, '10'),
(30, '6'),
(30, '7'),
(30, '8'),
(30, '9'),
(31, '11'),
(31, '12'),
(31, '13'),
(31, '14'),
(31, '15'),
(32, '16'),
(32, '17'),
(32, '18'),
(32, '19'),
(32, '20'),
(33, '1'),
(33, '2'),
(33, '3'),
(33, '4'),
(33, '5'),
(34, '10'),
(34, '6'),
(34, '7'),
(34, '8'),
(34, '9'),
(35, '11'),
(35, '12'),
(35, '13'),
(35, '14'),
(35, '15'),
(36, '16'),
(36, '17'),
(36, '18'),
(36, '19'),
(36, '20'),
(37, '1'),
(37, '2'),
(37, '21'),
(37, '3'),
(37, '4'),
(37, '5'),
(38, '10'),
(38, '6'),
(38, '7'),
(38, '8'),
(38, '9'),
(39, '11'),
(39, '12'),
(39, '13'),
(39, '14'),
(39, '15'),
(40, '16'),
(40, '17'),
(40, '18'),
(40, '19'),
(40, '20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `role_id` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`role_id`, `nombre`, `descripcion`) VALUES
('1', 'Coordinador', 'Usuario con permisos de coordinación académica'),
('2', 'Alumno', 'Usuario que es estudiante de una carrera');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `salon`
--

CREATE TABLE `salon` (
  `salon_id` varchar(50) NOT NULL,
  `capacidad` int(11) NOT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `campus_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `salon`
--

INSERT INTO `salon` (`salon_id`, `capacidad`, `tipo`, `campus_id`) VALUES
('1', 30, 'Aula normal', '1'),
('10', 20, 'Laboratorio', '2'),
('11', 35, 'Aula normal', '2'),
('12', 50, 'Auditorio', '2'),
('13', 30, 'Aula normal', '1'),
('14', 25, 'Laboratorio', '1'),
('15', 40, 'Aula normal', '1'),
('16', 20, 'Laboratorio', '1'),
('17', 35, 'Aula normal', '2'),
('18', 50, 'Auditorio', '2'),
('19', 30, 'Aula normal', '2'),
('2', 25, 'Aula normal', '1'),
('20', 25, 'Laboratorio', '2'),
('3', 40, 'Aula normal', '1'),
('4', 20, 'Laboratorio', '1'),
('5', 35, 'Aula normal', '1'),
('6', 50, 'Auditorio', '1'),
('7', 30, 'Aula normal', '2'),
('8', 25, 'Laboratorio', '2'),
('9', 40, 'Aula normal', '2');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `ivd_id` int(11) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `primer_apellido` varchar(100) NOT NULL,
  `segundo_apellido` varchar(100) DEFAULT NULL,
  `correo_institucional` varchar(100) NOT NULL,
  `role_id` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`ivd_id`, `contrasena`, `nombre`, `primer_apellido`, `segundo_apellido`, `correo_institucional`, `role_id`) VALUES
(1, 'pass123', 'Marta', 'López', 'Díaz', 'marta.lopez@universidad.edu', '1'),
(2, 'pass123', 'Ana', 'Rodríguez', 'García', 'ana.rodriguez@universidad.edu', '1'),
(21, 'pass123', 'Diego', 'Luna', 'Méndez', 'diego.luna@universidad.edu', '2'),
(22, 'pass123', 'Lucía', 'Suárez', 'Rojas', 'lucia.suarez@universidad.edu', '2'),
(23, 'pass123', 'Héctor', 'Pérez', 'Ortega', 'hector.perez@universidad.edu', '2'),
(24, 'pass123', 'Andrea', 'Navarro', 'Castillo', 'andrea.navarro@universidad.edu', '2'),
(25, 'pass123', 'Daniel', 'Morales', 'Gómez', 'daniel.morales@universidad.edu', '2'),
(26, 'pass123', 'Isabela', 'Torres', 'Ramírez', 'isabela.torres@universidad.edu', '2'),
(27, 'pass123', 'Tomás', 'Vargas', 'Salinas', 'tomas.vargas@universidad.edu', '2'),
(28, 'pass123', 'Mariana', 'Soto', 'Pacheco', 'mariana.soto@universidad.edu', '2'),
(29, 'pass123', 'Rodrigo', 'Jiménez', 'Cruz', 'rodrigo.jimenez@universidad.edu', '2'),
(30, 'pass123', 'Valentina', 'Medina', 'Reyes', 'valentina.medina@universidad.edu', '2'),
(31, 'pass123', 'Sergio', 'León', 'Aguilar', 'sergio.leon@universidad.edu', '2'),
(32, 'pass123', 'Camila', 'Salazar', 'Chávez', 'camila.salazar@universidad.edu', '2'),
(33, 'pass123', 'Adrián', 'Pacheco', 'Flores', 'adrian.pacheco@universidad.edu', '2'),
(34, 'pass123', 'Renata', 'Aguilar', 'Silva', 'renata.aguilar@universidad.edu', '2'),
(35, 'pass123', 'Emilio', 'Romero', 'Vega', 'emilio.romero@universidad.edu', '2'),
(36, 'pass123', 'Paola', 'Moreno', 'Ríos', 'paola.moreno@universidad.edu', '2'),
(37, 'pass123', 'Jorge', 'Figueroa', 'Montes', 'jorge.figueroa@universidad.edu', '2'),
(38, 'pass123', 'Diana', 'Peña', 'Peralta', 'diana.pena@universidad.edu', '2'),
(39, 'pass123', 'Gustavo', 'Lara', 'Chávez', 'gustavo.lara@universidad.edu', '2'),
(40, 'pass123', 'Carla', 'Santos', 'Reyes', 'carla.santos@universidad.edu', '2');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alumno`
--
ALTER TABLE `alumno`
  ADD PRIMARY KEY (`ivd_id`),
  ADD KEY `plan_estudio_id` (`plan_estudio_id`);

--
-- Indices de la tabla `bloque_tiempo`
--
ALTER TABLE `bloque_tiempo`
  ADD PRIMARY KEY (`bloque_tiempo_id`);

--
-- Indices de la tabla `campus`
--
ALTER TABLE `campus`
  ADD PRIMARY KEY (`campus_id`);

--
-- Indices de la tabla `carrera`
--
ALTER TABLE `carrera`
  ADD PRIMARY KEY (`carrera_id`);

--
-- Indices de la tabla `ciclo_escolar`
--
ALTER TABLE `ciclo_escolar`
  ADD PRIMARY KEY (`ciclo_escolar_id`);

--
-- Indices de la tabla `coordinador`
--
ALTER TABLE `coordinador`
  ADD PRIMARY KEY (`ivd_id`),
  ADD KEY `carrera_id` (`carrera_id`);

--
-- Indices de la tabla `grupo`
--
ALTER TABLE `grupo`
  ADD PRIMARY KEY (`grupo_id`),
  ADD KEY `materia_id` (`materia_id`),
  ADD KEY `profesor_id` (`profesor_id`),
  ADD KEY `salon_id` (`salon_id`),
  ADD KEY `ciclo_escolar_id` (`ciclo_escolar_id`);

--
-- Indices de la tabla `grupo_bloque_tiempo`
--
ALTER TABLE `grupo_bloque_tiempo`
  ADD PRIMARY KEY (`grupo_id`,`horario_id`);

--
-- Indices de la tabla `historial_academico`
--
ALTER TABLE `historial_academico`
  ADD PRIMARY KEY (`ivd_id`,`materia_id`,`ciclo_escolar_id`),
  ADD KEY `materia_id` (`materia_id`),
  ADD KEY `ciclo_escolar_id` (`ciclo_escolar_id`);

--
-- Indices de la tabla `materia`
--
ALTER TABLE `materia`
  ADD PRIMARY KEY (`materia_id`),
  ADD KEY `profesor_id` (`profesor_id`);

--
-- Indices de la tabla `materia_requisito`
--
ALTER TABLE `materia_requisito`
  ADD PRIMARY KEY (`materia_id`,`requisito_id`),
  ADD KEY `requisito_id` (`requisito_id`);

--
-- Indices de la tabla `plan_estudio`
--
ALTER TABLE `plan_estudio`
  ADD PRIMARY KEY (`plan_estudio_id`),
  ADD KEY `carrera_id` (`carrera_id`);

--
-- Indices de la tabla `plan_materia`
--
ALTER TABLE `plan_materia`
  ADD PRIMARY KEY (`plan_estudio_id`,`materia_id`),
  ADD KEY `materia_id` (`materia_id`);

--
-- Indices de la tabla `profesor`
--
ALTER TABLE `profesor`
  ADD PRIMARY KEY (`profesor_id`);

--
-- Indices de la tabla `profesor_bloque_tiempo`
--
ALTER TABLE `profesor_bloque_tiempo`
  ADD PRIMARY KEY (`profesor_id`,`bloque_tiempo_id`),
  ADD KEY `bloque_tiempo_id` (`bloque_tiempo_id`);

--
-- Indices de la tabla `resultado_inscripcion`
--
ALTER TABLE `resultado_inscripcion`
  ADD PRIMARY KEY (`alumno_id`,`grupo_id`),
  ADD KEY `grupo_id` (`grupo_id`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`role_id`);

--
-- Indices de la tabla `salon`
--
ALTER TABLE `salon`
  ADD PRIMARY KEY (`salon_id`),
  ADD KEY `campus_id` (`campus_id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`ivd_id`),
  ADD UNIQUE KEY `correo_institucional` (`correo_institucional`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `ivd_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `alumno`
--
ALTER TABLE `alumno`
  ADD CONSTRAINT `alumno_ibfk_1` FOREIGN KEY (`ivd_id`) REFERENCES `usuario` (`ivd_id`),
  ADD CONSTRAINT `alumno_ibfk_2` FOREIGN KEY (`plan_estudio_id`) REFERENCES `plan_estudio` (`plan_estudio_id`);

--
-- Filtros para la tabla `coordinador`
--
ALTER TABLE `coordinador`
  ADD CONSTRAINT `coordinador_ibfk_1` FOREIGN KEY (`ivd_id`) REFERENCES `usuario` (`ivd_id`),
  ADD CONSTRAINT `coordinador_ibfk_2` FOREIGN KEY (`carrera_id`) REFERENCES `carrera` (`carrera_id`);

--
-- Filtros para la tabla `grupo`
--
ALTER TABLE `grupo`
  ADD CONSTRAINT `grupo_ibfk_1` FOREIGN KEY (`materia_id`) REFERENCES `materia` (`materia_id`),
  ADD CONSTRAINT `grupo_ibfk_2` FOREIGN KEY (`profesor_id`) REFERENCES `profesor` (`profesor_id`),
  ADD CONSTRAINT `grupo_ibfk_3` FOREIGN KEY (`salon_id`) REFERENCES `salon` (`salon_id`),
  ADD CONSTRAINT `grupo_ibfk_4` FOREIGN KEY (`ciclo_escolar_id`) REFERENCES `ciclo_escolar` (`ciclo_escolar_id`);

--
-- Filtros para la tabla `grupo_bloque_tiempo`
--
ALTER TABLE `grupo_bloque_tiempo`
  ADD CONSTRAINT `grupo_bloque_tiempo_ibfk_1` FOREIGN KEY (`grupo_id`) REFERENCES `grupo` (`grupo_id`);

--
-- Filtros para la tabla `historial_academico`
--
ALTER TABLE `historial_academico`
  ADD CONSTRAINT `historial_academico_ibfk_1` FOREIGN KEY (`ivd_id`) REFERENCES `alumno` (`ivd_id`),
  ADD CONSTRAINT `historial_academico_ibfk_2` FOREIGN KEY (`materia_id`) REFERENCES `materia` (`materia_id`),
  ADD CONSTRAINT `historial_academico_ibfk_3` FOREIGN KEY (`ciclo_escolar_id`) REFERENCES `ciclo_escolar` (`ciclo_escolar_id`);

--
-- Filtros para la tabla `materia`
--
ALTER TABLE `materia`
  ADD CONSTRAINT `materia_ibfk_1` FOREIGN KEY (`profesor_id`) REFERENCES `profesor` (`profesor_id`);

--
-- Filtros para la tabla `materia_requisito`
--
ALTER TABLE `materia_requisito`
  ADD CONSTRAINT `materia_requisito_ibfk_1` FOREIGN KEY (`materia_id`) REFERENCES `materia` (`materia_id`),
  ADD CONSTRAINT `materia_requisito_ibfk_2` FOREIGN KEY (`requisito_id`) REFERENCES `materia` (`materia_id`);

--
-- Filtros para la tabla `plan_estudio`
--
ALTER TABLE `plan_estudio`
  ADD CONSTRAINT `plan_estudio_ibfk_1` FOREIGN KEY (`carrera_id`) REFERENCES `carrera` (`carrera_id`);

--
-- Filtros para la tabla `plan_materia`
--
ALTER TABLE `plan_materia`
  ADD CONSTRAINT `plan_materia_ibfk_1` FOREIGN KEY (`plan_estudio_id`) REFERENCES `plan_estudio` (`plan_estudio_id`),
  ADD CONSTRAINT `plan_materia_ibfk_2` FOREIGN KEY (`materia_id`) REFERENCES `materia` (`materia_id`);

--
-- Filtros para la tabla `profesor_bloque_tiempo`
--
ALTER TABLE `profesor_bloque_tiempo`
  ADD CONSTRAINT `profesor_bloque_tiempo_ibfk_1` FOREIGN KEY (`profesor_id`) REFERENCES `profesor` (`profesor_id`),
  ADD CONSTRAINT `profesor_bloque_tiempo_ibfk_2` FOREIGN KEY (`bloque_tiempo_id`) REFERENCES `bloque_tiempo` (`bloque_tiempo_id`);

--
-- Filtros para la tabla `resultado_inscripcion`
--
ALTER TABLE `resultado_inscripcion`
  ADD CONSTRAINT `resultado_inscripcion_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumno` (`ivd_id`),
  ADD CONSTRAINT `resultado_inscripcion_ibfk_2` FOREIGN KEY (`grupo_id`) REFERENCES `grupo` (`grupo_id`);

--
-- Filtros para la tabla `salon`
--
ALTER TABLE `salon`
  ADD CONSTRAINT `salon_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campus` (`campus_id`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `rol` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
