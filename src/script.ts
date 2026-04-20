


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
const imageContainer = get("image-container")
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
			reader.onload = (e) => {
				const result = e.target?.result
				if (typeof result !== "string") return
				imageContainer.append(createDraggableImage(result))
			}
			reader.readAsDataURL(file)
		}
	}
})




imageContainer.addEventListener("mouseenter", () => {
	dragDestination.set(imageContainer)
})




let dragging = false
const dragDestination = (()=>{
	let el:null|HTMLElement = null

	function set(element?:HTMLElement) {
		el = element ?? null
	}

	return {
		set,
		get: ()=>el,
	} as const
})()

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
			const element = dragDestination.get()
			if (element) {
				element.append(root)
				dragDestination.set()
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




function createGridSlot(row:number, column:number) {
	const endRow =    row + 1
	const endColumn = column + 1

	const root = create('div')
	root.className = 'grid-cell drag-destination grid-slot'
	root.style.gridRow = `${row}/${endRow}`
	root.style.gridColumn = `${column}/${endColumn}`

	root.addEventListener("mouseenter", () => {
		console.log("Mouse entered", row, column);
		dragDestination.set(root)
	})

	return root
}



//The Grid, as in the area of the grid that is added by the script does not start at 1,1 there are styling elements that and other stuff that push the grid down and right to these two constants below
const gridWall = 1
const gridCeiling = 1


const mainGrid = get('main-grid')
const addColumnButton = get('add-column-button')
const addRowButton = get('add-row-button')




function addRow(startRow:number, columnsAmount:number, startColumn:number, color:string, textContent:string) {
	const endRow = startRow + 1
	const gridTier = create('div')
	gridTier.className = 'grid-cell grid-tier grid-tier-row'
	gridTier.style.gridRow = `${startRow}/${endRow}`
	gridTier.style.gridColumn = `${startColumn}/${startColumn+1}`
	gridTier.style.backgroundColor = color

	const p = create("p")
	p.className = "tier-name-text"
	p.textContent = textContent
	p.contentEditable = "true"
	gridTier.append(p)
	mainGrid.append(gridTier)

	for (let i = 0; i < columnsAmount; i++) {
		mainGrid.append(createGridSlot(startRow, startColumn+i+1))
	}

	const laneOptions = createRowOptions()
	laneOptions.style.gridRow = `${startRow}/${endRow}`
	laneOptions.style.gridColumn = `${columnsAmount+startColumn+1}/${columnsAmount+startColumn+2}`
	mainGrid.append(laneOptions)


	const columnOptionsElements = getAll('column-options')
	for (const element of columnOptionsElements) {
		element.style.gridRow = `${endRow}/${startRow+2}`
	}	
}




function addColumn(startColumn:number, rowsAmount:number, startRow:number, color:string, textContent:string) {
	const gridTier = create('div')
	gridTier.className = 'grid-cell grid-tier grid-tier-column'
	gridTier.style.gridColumn = `${startColumn}/${startColumn+1}`
	gridTier.style.gridRow = `${startRow}/${startRow+1}`
	gridTier.style.backgroundColor = color

	const p = create("p")
	p.className = "tier-name-text"
	p.textContent = textContent
	p.contentEditable = "true"
	gridTier.append(p)
	mainGrid.append(gridTier)

	for (let i = 0; i < rowsAmount; i++) {
		mainGrid.append(createGridSlot(startRow+i+1, startColumn))
	}

	const laneOptions = createColumnOptions()
	laneOptions.style.gridColumn = `${startColumn}/${startColumn+1}`
	laneOptions.style.gridRow = `${rowsAmount+startRow+1}/${rowsAmount+startRow+2}`
	mainGrid.append(laneOptions)


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
}




function removeColumn(startColumn:number, startRow:number) {
	const elementsToCheck = getAll("grid-cell")
	const elementsToRemove = getGridArea(startRow, startColumn, Infinity, startColumn+1, elementsToCheck)
	for (const element of elementsToRemove) {
		element.remove()
	}
	shiftGridElements(getGridArea(1,startColumn+1,Infinity,Infinity,getAll("grid-cell")),-1,0)
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
	const root = create('div')
	root.className = 'grid-cell lane-options row-options'

	const removeLaneButton = create('button')
	removeLaneButton.className = 'remove-lane-button remove-row-button'
	root.append(removeLaneButton)

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
		shiftGridElements(elementsOnThisRow,0,1)
		shiftGridElements(elementsOnRowBelow,0,-1)
	})

	shiftRowDownButton.innerHTML += `<img src="img/arrow-icon.png" alt="arrow-icon" class="${'shift-row-down-arrow'} shift-arrow">`
	root.append(shiftRowDownButton)

	const shiftRowUpButton = create('button')
	shiftRowUpButton.className = 'shift-row-up-button'

	shiftRowUpButton.addEventListener('click',()=>{
		const thisRow = Number(root.style.gridRowStart)
		const rowAbove = Number(root.style.gridRowStart)-1
		const elementsOnThisRow =  getGridArea(thisRow,  gridWall, thisRow+1,  Infinity, getAll("grid-cell"))
		const elementsOnRowAbove = getGridArea(rowAbove, gridWall, rowAbove+1, Infinity, getAll("grid-cell"))
		shiftGridElements(elementsOnThisRow,0,-1)
		shiftGridElements(elementsOnRowAbove,0,1)
	})

	shiftRowUpButton.innerHTML += `<img src="img/arrow-icon.png" alt="arrow-icon" class="${'shift-row-up-arrow'} shift-arrow">`
	root.append(shiftRowUpButton)
	
	return root
}




function createColumnOptions() {
	const root = create('div')
	root.className = 'grid-cell lane-options column-options'

	const removeLaneButton = create('button')
	removeLaneButton.className = 'remove-lane-button remove-column-button'
	root.append(removeLaneButton)

	removeLaneButton.addEventListener('click',()=>{
		removeColumn(Number(root.style.gridColumnStart),gridCeiling)
	})

	const shiftColumnDownButton = create('button')
	shiftColumnDownButton.className = 'shift-column-right-button'

	shiftColumnDownButton.addEventListener('click',()=>{
		const thisColumn = Number(root.style.gridColumnStart)
		const columnBelow = Number(root.style.gridColumnStart)+1
		const elementsOnThisColumn =  getGridArea(gridWall, thisColumn,  Infinity, thisColumn+1,  getAll("grid-cell"))
		const elementsOnColumnBelow = getGridArea(gridWall, columnBelow, Infinity, columnBelow+1, getAll("grid-cell"))
		shiftGridElements(elementsOnThisColumn,1,0)
		shiftGridElements(elementsOnColumnBelow,-1,0)
	})

	shiftColumnDownButton.innerHTML += `<img src="img/arrow-icon.png" alt="arrow-icon" class="${'shift-column-right-arrow'} shift-arrow">`
	root.append(shiftColumnDownButton)

	const shiftColumnUpButton = create('button')
	shiftColumnUpButton.className = 'shift-column-left-button'

	shiftColumnUpButton.addEventListener('click',()=>{
		const thisColumn = Number(root.style.gridColumnStart)
		const columnAbove = Number(root.style.gridColumnStart)-1
		const elementsOnThisColumn =  getGridArea(gridWall, thisColumn,  Infinity, thisColumn+1,  getAll("grid-cell"))
		const elementsOnColumnAbove = getGridArea(gridWall, columnAbove, Infinity, columnAbove+1, getAll("grid-cell"))
		shiftGridElements(elementsOnThisColumn,-1,0)
		shiftGridElements(elementsOnColumnAbove,1,0)
	})

	shiftColumnUpButton.innerHTML += `<img src="img/arrow-icon.png" alt="arrow-icon" class="${'shift-column-left-arrow'} shift-arrow">`
	root.append(shiftColumnUpButton)
	
	return root
}




const colorPresetRows = ['rgb(255, 127, 127)','rgb(255, 191, 127)','rgb(255, 223, 127)','rgb(255, 255, 127)','rgb(191, 255, 127)','rgb(127, 255, 127)','rgb(127, 255, 249)'] as const
const colorPresetColumns = ['rgb(255, 127, 251)','rgb(225, 127, 255)','rgb(180, 127, 255)','rgb(133, 127, 255)','rgb(127, 159, 255)','rgb(127, 204, 255)','rgb(127, 255, 249)'] as const

const namePresetRows = ['S','A','B','C','D','E','F'] as const
const namePresetColumns = ['\u03C9','\u03B1','\u03B2','\u03B3','\u03B4','\u03B5','\u03B6','\u03B7'] as const




addRow(gridCeiling+1,0,gridWall, colorPresetRows[0], 'S')
addRow(gridCeiling+2,0,gridWall, colorPresetRows[1], 'A')
addRow(gridCeiling+3,0,gridWall, colorPresetRows[2], 'B')
addRow(gridCeiling+4,0,gridWall, colorPresetRows[3], 'C')
addRow(gridCeiling+5,0,gridWall, colorPresetRows[4], 'D')
addColumn(gridWall+1,5,gridCeiling, colorPresetColumns[0], namePresetColumns[0])
addColumn(gridWall+2,5,gridCeiling, colorPresetColumns[1], namePresetColumns[1])
addColumn(gridWall+3,5,gridCeiling, colorPresetColumns[2], namePresetColumns[2])
addColumn(gridWall+4,5,gridCeiling, colorPresetColumns[3], namePresetColumns[3])
addColumn(gridWall+5,5,gridCeiling, colorPresetColumns[4], namePresetColumns[4])





const rows    = () => getAll("grid-tier-row")   .length
const columns = () => getAll("grid-tier-column").length



addRowButton.addEventListener('click',()=>{
	const color = colorPresetRows[rows()]??""
	const name = namePresetRows[rows()]??"none"
	addRow(rows() + gridCeiling+1,columns(),gridWall,color,name)
})



addColumnButton.addEventListener('click',()=>{
	const color = colorPresetColumns[columns()]??""
	const name = namePresetColumns[columns()]??"none"
	addColumn(columns() + gridCeiling+1,rows(),gridWall,color,name)
})


