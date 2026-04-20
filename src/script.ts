


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




type GridArea = Readonly<{
	rowStart:   number
	columnStart:number
	rowEnd:     number
	columnEnd:  number
}>

function getArea(el:HTMLElement):GridArea {
	return {
		rowStart:   Number(el.style.gridRowStart),
		columnStart:Number(el.style.gridColumnStart),
		rowEnd:     Number(el.style.gridRowEnd),
		columnEnd:  Number(el.style.gridColumnEnd),
	}
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

	const laneOptions = createLaneOptions("row")
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

	const laneOptions = createLaneOptions("column")
	laneOptions.style.gridColumn = `${startColumn}/${startColumn+1}`
	laneOptions.style.gridRow = `${rowsAmount+startRow+1}/${rowsAmount+startRow+2}`
	mainGrid.append(laneOptions)


	const rowOptionsElements = getAll('row-options')
	for (const element of rowOptionsElements) {
		element.style.gridColumn = `${startColumn+1}/${startColumn+2}`
	}
}




function removeRow(startRow:number) {
	const elementsToRemove = getAll("grid-cell").filter(el => getArea(el).rowStart === startRow)
	for (const element of elementsToRemove) {
		element.remove()
	}
	shiftGridElements(getAll("grid-cell").filter(el => getArea(el).rowStart > startRow),0,-1)
}




function removeColumn(startColumn:number) {
	const elementsToRemove = getAll("grid-cell").filter(el => getArea(el).columnStart === startColumn)
	for (const element of elementsToRemove) {
		element.remove()
	}
	shiftGridElements(getAll("grid-cell").filter(el => getArea(el).columnStart > startColumn),-1,0)
}




function shiftGridElements(elementsToMove:readonly HTMLElement[], x:number, y:number) {
	for (const element of elementsToMove) {
		element.style.gridColumnStart = String(Number(element.style.gridColumnStart) + x)
		element.style.gridColumnEnd =   String(Number(element.style.gridColumnEnd) + x)
		element.style.gridRowStart =    String(Number(element.style.gridRowStart) + y)
		element.style.gridRowEnd =      String(Number(element.style.gridRowEnd) + y)
	}
}




type Axis = "row" | "column"

function createLaneOptions(axis: Axis) {
	const root = create('div')
	root.className = `grid-cell lane-options ${axis}-options`

	const isRow = axis === "row"

	const getIndex = () => Number(getComputedStyle(root)[isRow ? "gridRowStart" : "gridColumnStart"])


	const removeBtn = create('button')
	removeBtn.className = `remove-lane-button remove-${axis}-button`
	removeBtn.onclick = () => {
		if (isRow) removeRow(getIndex())
		else removeColumn(getIndex())
	}
	root.append(removeBtn)

	function shift(dir: 1 | -1) {
		const i = getIndex()
		if (i <= 2 && dir === -1) return
		if (i > (isRow ? rows() : columns()) && dir === 1) return
		const other = i + dir
		const cells = getAll("grid-cell")

		const a = isRow
			? cells.filter(c => getArea(c).rowStart === i)
			: cells.filter(c => getArea(c).columnStart === i)

		const b = isRow
			? cells.filter(c => getArea(c).rowStart === other)
			: cells.filter(c => getArea(c).columnStart === other)

		shiftGridElements(a, isRow ? 0 : dir, isRow ? dir : 0)
		shiftGridElements(b, isRow ? 0 : -dir, isRow ? -dir : 0)
	}

	const downBtn = create('button')
	downBtn.className = `shift-${axis}-${isRow ? "down" : "right"}-button`
	downBtn.onclick = () => shift(1)
	downBtn.append(image(true))
	root.append(downBtn)

	const upBtn = create('button')
	upBtn.className = `shift-${axis}-${isRow ? "up" : "left"}-button`
	upBtn.onclick = () => shift(-1)
	upBtn.append(image(false))
	root.append(upBtn)

	function image(isForward:boolean) {
		const root = create("img")
		root.src = "img/arrow-icon.png"
		const dir = isRow ?
			isForward ? "down" : "up" :
			isForward ? "right" : "left"
		root.className = `shift-${axis}-${dir}-arrow shift-arrow`
		return root
	}

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


