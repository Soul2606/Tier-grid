


function get<T extends HTMLElement = HTMLElement>(id:string) {
	const el = document.getElementById(id)
	if (!el) throw new Error(`cannot get element ${id}`);
	return el as T
}




function getAll<T extends HTMLElement = HTMLElement>(className:string) {
	return Array.from(document.querySelectorAll<T>("."+className))
}




function create<K extends keyof HTMLElementTagNameMap>(
	element: K,
	ns?: string
): HTMLElementTagNameMap[K] {
	if (ns) return document.createElementNS(ns, element) as HTMLElementTagNameMap[K]
	return document.createElement(element)
}




const formSubmitButton = get('form-submit-button')
formSubmitButton.addEventListener('click', ()=>{
	const inputImageFiles = get<HTMLInputElement>('input-image-files')

	const files = inputImageFiles.files
	if (files === null) {
		console.log("Cannot get files");
		return
	}
	
	for (const file of files) {			
		if (file) {
			const reader = new FileReader()
			reader.onload = function (e) {
				const result = e.target?.result
				if (typeof result !== "string") return
				get('image-container').appendChild(createDraggableImage(result))
			}
			reader.readAsDataURL(file)
		}
	}
})




let dragging = false
let dragDestination:null|HTMLElement = null
const dragDestinations = document.querySelectorAll<HTMLElement>('.drag-destination')
for (const dest of dragDestinations) {
	dest.addEventListener('mouseover',()=>{
		if (dragging) {
			console.log('set drag destination:', dest)
			dragDestination = dest
		}
	})
}




function createDraggableImage(src:string){
	const root = create('img')
	root.className = 'image'
	root.src = src

	root.addEventListener('mousedown',e=>{
		console.log('mouse down')
		e.preventDefault()
		dragging = true
		root.style.position = 'absolute'
		root.style.pointerEvents = 'none'
		
		const endDrag = ()=>{
			window.removeEventListener('mouseup',endDrag)
			window.removeEventListener('mousemove',mouseMove)
			root.style.position = 'unset'
			root.style.pointerEvents = 'auto'
			if (dragDestination) {
				dragDestination.appendChild(root)
				dragDestination = null
			}
			dragging = false
		}
		window.addEventListener('mouseup',endDrag)

		const mouseMove = (event:MouseEvent) => {
			if (event instanceof MouseEvent) {	
				const x = event.pageX
				const y = event.pageY		
				root.style.top = (y +'px')
				root.style.left = (x +'px')
			}
		}
		window.addEventListener('mousemove',mouseMove)
	})

	return root
}




const colorPresetRows = ['rgb(255, 127, 127)','rgb(255, 191, 127)','rgb(255, 223, 127)','rgb(255, 255, 127)','rgb(191, 255, 127)','rgb(127, 255, 127)','rgb(127, 255, 249)'] as const
const colorPresetColumns = ['rgb(255, 127, 251)','rgb(225, 127, 255)','rgb(180, 127, 255)','rgb(133, 127, 255)','rgb(127, 159, 255)','rgb(127, 204, 255)','rgb(127, 255, 249)'] as const

const namePresetRows = ['S','A','B','C','D','E','F'] as const
const namePresetColumns = ['&omega;','&alpha;','&beta;','&gamma;','&delta;','&epsilon;','&zeta;','&eta;'] as const



//The Grid, as in the area of the grid that is added by the script does not start at 1,1 there are styling elements that and other stuff that push the grid down and right to these two constants below
const gridWall = 1
const gridCeiling = 1


const mainGrid = get('main-grid')
const addColumnButton = get('add-column-button')
const addRowButton = get('add-row-button')




function addRow(startRow:number, columnsAmount:number, startColumn:number, color:string, textContent:string) {
	const gridTier = create('div')
	gridTier.className = 'grid-cell grid-tier'
	gridTier.style.gridRow = `${startRow}/${startRow+1}`
	gridTier.style.gridColumn = `${startColumn}/${startColumn+1}`
	gridTier.style.backgroundColor = color
	gridTier.innerHTML = `<p class="tier-name-text">${textContent}</p>`
	mainGrid.appendChild(gridTier)

	for (let i = 0; i < columnsAmount; i++) {
		const gridSlot = create('div')
		gridSlot.className = 'grid-cell drag-destination grid-slot'
		gridSlot.style.gridRow = `${startRow}/${startRow+1}`
		gridSlot.style.gridColumn = `${i+startColumn+1}/${i+startColumn+2}`
		mainGrid.appendChild(gridSlot)
	}

	const laneOptions = createRowOptions()
	laneOptions.style.gridRow = `${startRow}/${startRow+1}`
	laneOptions.style.gridColumn = `${columnsAmount+startColumn+1}/${columnsAmount+startColumn+2}`
	mainGrid.appendChild(laneOptions)


	const columnOptionsElements = getAll('column-options')
	for (const element of columnOptionsElements) {
		element.style.gridRow = `${startRow+1}/${startRow+2}`
	}	
}




function addColumn(startColumn:number, rowsAmount:number, startRow:number, color:string, textContent:string) {
	const gridTier = create('div')
	gridTier.className = 'grid-cell grid-tier'
	gridTier.style.gridColumn = `${startColumn}/${startColumn+1}`
	gridTier.style.gridRow = `${startRow}/${startRow+1}`
	gridTier.style.backgroundColor = color
	gridTier.innerHTML = `<p class="tier-name-text">${textContent}</p>`
	mainGrid.appendChild(gridTier)

	for (let i = 0; i < rowsAmount; i++) {
		const gridSlot = create('div')
		gridSlot.className = 'grid-cell drag-destination grid-slot'
		gridSlot.style.gridColumn = `${startColumn}/${startColumn+1}`
		gridSlot.style.gridRow = `${i+startRow+1}/${i+startRow+2}`
		mainGrid.appendChild(gridSlot)
	}

	const laneOptions = create("div")
	laneOptions.textContent = "WIP"
	laneOptions.style.color = "white"
	laneOptions.style.gridColumn = `${startColumn}/${startColumn+1}`
	laneOptions.style.gridRow = `${rowsAmount+startRow+1}/${rowsAmount+startRow+2}`
	mainGrid.appendChild(laneOptions)


	const rowOptionsElements = getAll('row-options')
	for (const element of rowOptionsElements) {
		element.style.gridColumn = `${startColumn+1}/${startColumn+2}`
	}
}




function getGridArea(startRow:number, startColumn:number, endRow:number, endColumn:number, elementsToCheck:readonly HTMLElement[]) {
	return Array.from(elementsToCheck).filter(element=>{
		const style = window.getComputedStyle(element)
		return Number(style.gridRowStart) >= startRow&&
		Number(style.gridRowEnd) <= endRow&&
		Number(style.gridColumnStart) >= startColumn&&
		Number(style.gridColumnEnd) <= endColumn
	})
}




function removeRow(startRow:number, startColumn:number) {
	const elementsToCheck = getAll("grid-cell")
	const elementsToRemove = getGridArea(startRow, startColumn, startRow+1, Infinity, elementsToCheck)
	for (const element of elementsToRemove) {
		element.remove()
	}
	shiftGridElements(getGridArea(startRow+1,1,Infinity,Infinity,getAll("grid-cell")),0,-1)
	rows--
}




function removeColumn(startColumn:number, startRow:number) {
	const elementsToCheck = getAll("grid-cell")
	const elementsToRemove = getGridArea(startRow, startColumn, Infinity, startColumn+1, elementsToCheck)
	for (const element of elementsToRemove) {
		element.remove()
	}
	shiftGridElements(getGridArea(1,startColumn+1,Infinity,Infinity,getAll("grid-cell")),-1,0)
	columns--
}




function shiftGridElements(elementsToMove:readonly HTMLElement[], x:number, y:number) {
	for (const element of elementsToMove) {
		element.style.gridColumnStart = String(Number(element.style.gridColumnStart) + x)
		element.style.gridColumnEnd =   String(Number(element.style.gridColumnEnd) + x)
		element.style.gridRowStart =    String(Number(element.style.gridRowStart) + y)
		element.style.gridRowEnd =      String(Number(element.style.gridRowEnd) + y)
	}
}




function createRowOptions() {
	//If row is false, assume column
	const root = create('div')
	root.className = 'grid-cell lane-options row-options'

	const removeLaneButton = create('button')
	removeLaneButton.className = 'remove-lane-button remove-row-button'
	root.appendChild(removeLaneButton)

	removeLaneButton.addEventListener('click',()=>{
		removeRow(Number(root.style.gridRowStart),gridWall)
	})

	const shiftRowDownButton = create('button')
	shiftRowDownButton.className = 'shift-row-down-button'

	shiftRowDownButton.addEventListener('click',()=>{
		const thisRow = Number(root.style.gridRowStart)
		const rowBelow = Number(root.style.gridRowStart)+1
		const elementsOnThisRow =  getGridArea(thisRow,  gridCeiling, thisRow+1,  Infinity, getAll("grid-cell"))
		const elementsOnRowBelow = getGridArea(rowBelow, gridCeiling, rowBelow+1, Infinity, getAll("grid-cell"))
		if (elementsOnRowBelow.filter(e=>e.classList.contains('grid-slot')).length === 0) {
			return
		}
		shiftGridElements(elementsOnThisRow,0,1)
		shiftGridElements(elementsOnRowBelow,0,-1)
	})

	shiftRowDownButton.innerHTML += `<img src="img/arrow-icon.png" alt="arrow-icon" class="${'shift-row-down-arrow'} shift-arrow">`
	root.appendChild(shiftRowDownButton)

	const shiftRowUpButton = create('button')
	shiftRowUpButton.className = 'shift-row-up-button'

	shiftRowUpButton.addEventListener('click',()=>{
		const thisRow = Number(root.style.gridRowStart)
		const rowAbove = Number(root.style.gridRowStart)-1
		const elementsOnThisRow =  getGridArea(thisRow,  gridWall, thisRow+1,  Infinity, getAll("grid-cell"))
		const elementsOnRowAbove = getGridArea(rowAbove, gridWall, rowAbove+1, Infinity, getAll("grid-cell"))
		if (elementsOnRowAbove.filter(e=>e.classList.contains('grid-slot')).length === 0) {
			return
		}
		shiftGridElements(elementsOnThisRow,0,-1)
		shiftGridElements(elementsOnRowAbove,0,1)
	})

	shiftRowUpButton.innerHTML += `<img src="img/arrow-icon.png" alt="arrow-icon" class="${'shift-row-up-arrow'} shift-arrow">`
	root.appendChild(shiftRowUpButton)
	
	return root
}




addRow(gridCeiling+1,0,gridWall, colorPresetRows[0], 'S')
addRow(gridCeiling+2,0,gridWall, colorPresetRows[1], 'A')
addRow(gridCeiling+3,0,gridWall, colorPresetRows[2], 'B')
addRow(gridCeiling+4,0,gridWall, colorPresetRows[3], 'C')
addRow(gridCeiling+5,0,gridWall, colorPresetRows[4], 'D')
addColumn(gridWall+1,5,gridCeiling, colorPresetColumns[0], '&omega;')
addColumn(gridWall+2,5,gridCeiling, colorPresetColumns[1], '&alpha;')
addColumn(gridWall+3,5,gridCeiling, colorPresetColumns[2], '&beta;')
addColumn(gridWall+4,5,gridCeiling, colorPresetColumns[3], '&gamma;')
addColumn(gridWall+5,5,gridCeiling, colorPresetColumns[4], '&delta;')





let rows = 5
let columns = 5



addRowButton.addEventListener('click',()=>{
	const color = colorPresetRows[rows]??""
	const name = namePresetRows[rows]??"none"
	addRow(rows+gridCeiling+1,columns,gridWall,color,name)
	rows++
})



addColumnButton.addEventListener('click',()=>{
	const color = colorPresetColumns[columns]??""
	const name = namePresetColumns[columns]??"none"
	addColumn(columns+gridCeiling+1,rows,gridWall,color,name)
	columns++
})


