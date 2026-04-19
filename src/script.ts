


function get<T extends HTMLElement = HTMLElement>(id:string) {
	const el = document.getElementById(id)
	if (!el) throw new Error(`cannot get element ${id}`);
	return el as T
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
	const root = document.createElement('img')
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
const gridWall = 2
const gridCeiling = 2


const gridTireSet =       new Set<HTMLElement>()
const gridSlotSet =       new Set<HTMLElement>()
const optionsElementSet = new Set<HTMLElement>()
const gridCellsSet =      new Set<HTMLElement>()




const mainGrid = get('main-grid')
const addColumnButton = get('add-column-button')
const addRowButton = get('add-row-button')
const columnsDescriptionContainer = get('columns-description-container')
const rowDescriptionContainer = get('row-description-container')





function addRow(start_row:number, columns_amount:number, start_column:number, color:string, text_content:string) {
	const grid_tier = document.createElement('div')
	grid_tier.className = 'grid-rect grid-tier'
	grid_tier.style.gridRow = `${start_row}/${start_row+1}`
	grid_tier.style.gridColumn = `${start_column}/${start_column+1}`
	grid_tier.style.backgroundColor = color
	grid_tier.innerHTML = `<p class="tier-name-text">${text_content}</p>`
	mainGrid.appendChild(grid_tier)
	gridTireSet.add(grid_tier)

	for (let i = 0; i < columns_amount; i++) {
		const grid_slot = document.createElement('div')
		grid_slot.className = 'grid-rect drag-destination grid-slot'
		grid_slot.style.gridRow = `${start_row}/${start_row+1}`
		grid_slot.style.gridColumn = `${i+start_column+1}/${i+start_column+2}`
		mainGrid.appendChild(grid_slot)
		gridSlotSet.add(grid_slot)
	}

	const lane_options = createLaneOptionsElements(true)
	lane_options.style.gridRow = `${start_row}/${start_row+1}`
	lane_options.style.gridColumn = `${columns_amount+start_column+1}/${columns_amount+start_column+2}`
	mainGrid.appendChild(lane_options)
	optionsElementSet.add(lane_options)

	addRowButton.style.gridRow = `${start_row+1}/${start_row+2}`
	rowDescriptionContainer.style.gridRowEnd = String(start_row+1)

	const column_options_elements = document.querySelectorAll<HTMLElement>('.column-options')
	for (const element of column_options_elements) {
		element.style.gridRow = `${start_row+1}/${start_row+2}`
	}

	gridTireSet.forEach(element=>gridCellsSet.add(element))
	gridSlotSet.forEach(element=>gridCellsSet.add(element))
	optionsElementSet.forEach(element=>gridCellsSet.add(element))	

}




function addColumn(start_column:number, rows_amount:number, start_row:number, color:string, text_content:string) {
	const grid_tier = document.createElement('div')
	grid_tier.className = 'grid-rect grid-tier'
	grid_tier.style.gridColumn = `${start_column}/${start_column+1}`
	grid_tier.style.gridRow = `${start_row}/${start_row+1}`
	grid_tier.style.backgroundColor = color
	grid_tier.innerHTML = `<p class="tier-name-text">${text_content}</p>`
	mainGrid.appendChild(grid_tier)
	gridTireSet.add(grid_tier)

	for (let i = 0; i < rows_amount; i++) {
		const grid_slot = document.createElement('div')
		grid_slot.className = 'grid-rect drag-destination grid-slot'
		grid_slot.style.gridColumn = `${start_column}/${start_column+1}`
		grid_slot.style.gridRow = `${i+start_row+1}/${i+start_row+2}`
		mainGrid.appendChild(grid_slot)
		gridSlotSet.add(grid_slot)
	}

	const lane_options = createLaneOptionsElements(false)
	lane_options.style.gridColumn = `${start_column}/${start_column+1}`
	lane_options.style.gridRow = `${rows_amount+start_row+1}/${rows_amount+start_row+2}`
	mainGrid.appendChild(lane_options)
	optionsElementSet.add(lane_options)

	addColumnButton.style.gridColumn = `${start_column+1}/${start_column+2}`
	columnsDescriptionContainer.style.gridColumnEnd = String(start_column+1)

	const row_options_elements = document.querySelectorAll<HTMLElement>('.row-options')
	for (const element of row_options_elements) {
		element.style.gridColumn = `${start_column+1}/${start_column+2}`
	}

	gridTireSet.forEach(element=>gridCellsSet.add(element))
	gridSlotSet.forEach(element=>gridCellsSet.add(element))
	optionsElementSet.forEach(element=>gridCellsSet.add(element))

}




function getGridArea(start_row:number, start_column:number, end_row:number, end_column:number, elements_to_check:readonly HTMLElement[]) {
	return Array.from(elements_to_check).filter(element=>{
		const style = window.getComputedStyle(element)
		return Number(style.gridRowStart) >= start_row&&
		Number(style.gridRowEnd) <= end_row&&
		Number(style.gridColumnStart) >= start_column&&
		Number(style.gridColumnEnd) <= end_column
	})
}




function removeRow(start_row:number, start_column:number) {
	const elements_to_check = Array.from(gridCellsSet)
	const elements_to_remove = getGridArea(start_row, start_column, start_row+1, Infinity, elements_to_check)
	for (const element of elements_to_remove) {
		gridTireSet.delete(element)
		gridSlotSet.delete(element)
		optionsElementSet.delete(element)
		gridCellsSet.delete(element)
		element.remove()
	}
	shiftGridElements(getGridArea(start_row+1,1,Infinity,Infinity,Array.from(gridCellsSet)),0,-1)
	rowDescriptionContainer.style.gridRowEnd = String(Number(rowDescriptionContainer.style.gridRowEnd)-1)
	rows--
}




function removeColumn(start_column:number, start_row:number) {
	const elements_to_check = Array.from(gridCellsSet)
	const elements_to_remove = getGridArea(start_row, start_column, Infinity, start_column+1, elements_to_check)
	for (const element of elements_to_remove) {
		gridTireSet.delete(element)
		gridSlotSet.delete(element)
		optionsElementSet.delete(element)
		gridCellsSet.delete(element)
		element.remove()
	}
	shiftGridElements(getGridArea(1,start_column+1,Infinity,Infinity,Array.from(gridCellsSet)),-1,0)
	rowDescriptionContainer.style.gridColumnEnd = String(Number(rowDescriptionContainer.style.gridColumnEnd) - 1)
	columns--
}




function shiftGridElements(elements_to_move:readonly HTMLElement[], x:number, y:number) {
	for (const element of elements_to_move) {
		element.style.gridColumnStart = String(Number(element.style.gridColumnStart) + x)
		element.style.gridColumnEnd =   String(Number(element.style.gridColumnEnd) + x)
		element.style.gridRowStart =    String(Number(element.style.gridRowStart) + y)
		element.style.gridRowEnd =      String(Number(element.style.gridRowEnd) + y)
	}
}




function createLaneOptionsElements(row=true) {
	//If row is false, assume column
	const root = document.createElement('div')
	root.className = 'grid-rect lane-options'
	root.classList.add(row?'row-options':'column-options')

	const remove_lane_button = document.createElement('button')
	remove_lane_button.className = 'remove-lane-button'
	remove_lane_button.classList.add(row?'remove-row-button':'remove-column-button')
	root.appendChild(remove_lane_button)

	if (row) {
		remove_lane_button.addEventListener('click',()=>{
			removeRow(Number(root.style.gridRowStart),gridWall)
		})
	} else {
		remove_lane_button.addEventListener('click',()=>{
			removeColumn(Number(root.style.gridColumnStart),gridWall)
		})
	}

	if (row) {
		const shift_row_down_button = document.createElement('button')
		shift_row_down_button.className = 'shift-row-down-button'

		shift_row_down_button.addEventListener('click',()=>{
			const this_row = Number(root.style.gridRowStart)
			const row_below = Number(root.style.gridRowStart)+1
			const elements_on_this_row = getGridArea(this_row,gridCeiling,this_row+1,Infinity,Array.from(gridCellsSet))
			const elements_on_row_below = getGridArea(row_below,gridCeiling,row_below+1,Infinity,Array.from(gridCellsSet))
			if (elements_on_row_below.filter(e=>e.classList.contains('grid-slot')).length === 0) {
				return
			}
			shiftGridElements(elements_on_this_row,0,1)
			shiftGridElements(elements_on_row_below,0,-1)
		})

		shift_row_down_button.innerHTML += `<img src="img/arrow-icon.png" alt="arrow-icon" class="${'shift-row-down-arrow'} shift-arrow">`
		root.appendChild(shift_row_down_button)

		const shift_row_up_button = document.createElement('button')
		shift_row_up_button.className = 'shift-row-up-button'

		shift_row_up_button.addEventListener('click',()=>{
			const this_row = Number(root.style.gridRowStart)
			const row_above = Number(root.style.gridRowStart)-1
			const elements_on_this_row = getGridArea(this_row,2,this_row+1,Infinity,Array.from(gridCellsSet))
			const elements_on_row_above = getGridArea(row_above,2,row_above+1,Infinity,Array.from(gridCellsSet))
			if (elements_on_row_above.filter(e=>e.classList.contains('grid-slot')).length === 0) {
				return
			}
			shiftGridElements(elements_on_this_row,0,-1)
			shiftGridElements(elements_on_row_above,0,1)
		})

		shift_row_up_button.innerHTML += `<img src="img/arrow-icon.png" alt="arrow-icon" class="${'shift-row-up-arrow'} shift-arrow">`
		root.appendChild(shift_row_up_button)
	} else {
		const shift_column_right_button = document.createElement('button')
		shift_column_right_button.className = 'shift-column-right-button'
		shift_column_right_button.innerHTML += `<img src="img/arrow-icon.png" alt="arrow-icon" class="${'shift-column-right-arrow'} shift-arrow">`
		root.appendChild(shift_column_right_button)

		const shift_column_left_button = document.createElement('button')
		shift_column_left_button.className = 'shift-column-left-button'
		shift_column_left_button.innerHTML += `<img src="img/arrow-icon.png" alt="arrow-icon" class="${'shift-column-left-arrow'} shift-arrow">`
		root.appendChild(shift_column_left_button)
	}
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


