// js/board.js
// - Renderiza el tablero de Monopoly

async function renderBoard() {
    const boardContainer = document.getElementById('board-container');
    if (!boardContainer) {
        console.error('No se encontró el contenedor del tablero');
        return;
    }

    // Mostrar mensaje de carga
    boardContainer.innerHTML = '<div class="loading">Cargando tablero...</div>';

    try {
        // Obtener datos del tablero
        const boardData = await fetchBoard();
        
        // Limpiar contenedor
        boardContainer.innerHTML = '';

        // Crear el tablero
        const board = document.createElement('div');
        board.className = 'monopoly-board';

        // Renderizar cada lado del tablero
        renderBoardSide(board, boardData.bottom, 'bottom');
        renderBoardSide(board, boardData.right, 'right');
        renderBoardSide(board, boardData.top, 'top');
        renderBoardSide(board, boardData.left, 'left');

        // Añadir el centro del tablero
        const center = document.createElement('div');
        center.className = 'board-center';
        center.innerHTML = 'MONOPOLY';
        board.appendChild(center);

        boardContainer.appendChild(board);

    } catch (error) {
        console.error('Error al renderizar el tablero:', error);
        boardContainer.innerHTML = '<div class="error">Error al cargar el tablero</div>';
    }
}

function renderBoardSide(container, cells, side) {
    const sideElement = document.createElement('div');
    sideElement.className = `board-side board-${side}`;

    cells.forEach(cell => {
        const cellElement = document.createElement('div');
        cellElement.className = `board-cell cell-${cell.type}`;
        cellElement.dataset.id = cell.id;

        // Contenido de la casilla según el tipo
        let html = '';
        switch (cell.type) {
            case 'property':
                html = `
                    <div class="property-color ${cell.color}"></div>
                    <div class="property-name">${cell.name}</div>
                    <div class="property-price">$${cell.price}</div>
                `;
                break;
            case 'special':
                html = `
                    <div class="special-name">${cell.name}</div>
                    ${cell.action && cell.action.money ? 
                        `<div class="special-action">+$${cell.action.money}</div>` : ''}
                `;
                break;
            case 'community_chest':
            case 'chance':
                html = `
                    <div class="card-name">${cell.name}</div>
                    <div class="card-icon">?</div>
                `;
                break;
            case 'tax':
                html = `
                    <div class="tax-name">${cell.name}</div>
                    <div class="tax-amount">$${cell.amount}</div>
                `;
                break;
            case 'jail':
                html = `
                    <div class="jail-name">${cell.name}</div>
                    <div class="jail-icon">⛓️</div>
                `;
                break;
            case 'go_to_jail':
                html = `
                    <div class="jail-name">${cell.name}</div>
                    <div class="jail-icon">🚓</div>
                `;
                break;
            case 'free_parking':
                html = `
                    <div class="parking-name">${cell.name}</div>
                    <div class="parking-icon">🅿️</div>
                `;
                break;
            default:
                html = `<div class="cell-name">${cell.name}</div>`;
        }

        cellElement.innerHTML = html;
        sideElement.appendChild(cellElement);
    });

    container.appendChild(sideElement);
}

// Iniciar renderizado cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Solo renderizar si estamos en la página del tablero
    if (document.getElementById('board-container')) {
        renderBoard();
    }
});