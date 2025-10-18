# ✈️ Servinsa - Sistema de Reservas de Vuelos

Bienvenido al repositorio del front-end de Servinsa, una aplicación web para la gestión y reserva de asientos de avión. Este proyecto fue desarrollado con Angular.

## Descripción del Sitio

Servinsa es una plataforma que permite a los usuarios:
* Crear una cuenta y gestionar su perfil.
* Visualizar un mapa de asientos interactivo del avión.
* Reservar uno o múltiples asientos de forma manual o aleatoria.
* Gestionar sus reservas (modificar o cancelar).
* Cargar y descargar un listado completo de reservas en formato XML.
* Visualizar un panel de reportes con estadísticas clave.

## Prerrequisitos

Antes de empezar, asegúrate de tener instalado lo siguiente:
* [Node.js](https://nodejs.org/) (versión 18 o superior)
* [Angular CLI](https://angular.io/cli) (versión 17 o superior)
* [Git](https://git-scm.com/)

## Instalación

Sigue estos pasos para descargar y configurar el proyecto en tu máquina local.

1.  **Clona el repositorio:**
    ```bash
    git clone [https://github.com/Santiago-85/ProyectoFinal-ProgramacionWeb](https://github.com/Santiago-85/ProyectoFinal-ProgramacionWeb)
    ```

2.  **Navega a la carpeta del proyecto:**
    ```bash
    cd PROYECTOFINAL
    ```

3.  **Instala las dependencias:**
    Este comando descargará todos los paquetes necesarios para que Angular funcione.
    ```bash
    npm install
    ```

**Nota:** Este repositorio solo contiene el front-end. También necesitarás configurar y ejecutar la [API del back-end](https://github.com/Santiago-85/ProyectoFinalAPI-ProgramacionWeb).  

## Uso

1.  **Ejecuta la API:** Asegúrate de que el servidor del back-end esté corriendo (normalmente en `http://localhost:3000`).

2.  **Ejecuta la aplicación de Angular:**
    Este comando iniciará el servidor de desarrollo.
    ```bash
    ng serve -o
    ```

3.  **Abre la aplicación:** El comando anterior abrirá automáticamente tu navegador en `http://localhost:4200`, donde podrás interactuar con el sitio web.