


const form_submit_button = document.getElementById('form-submit-button')
form_submit_button.addEventListener('click', ()=>{
	const input_image_files = document.getElementById('input-image-files')
	const input_rows = Number.parseInt(document.getElementById('amount-of-rows').value)
	const input_columns = Number.parseInt(document.getElementById('amount-of-columns').value)

	
	const files = input_image_files.files
	console.log(files)
	for (const file of files) {			
		if (file) {
			const reader = new FileReader()
			reader.onload = function (e) {
				document.getElementById('image-container').appendChild(create_draggable_image(e.target.result))
			}
			reader.readAsDataURL(file)
		}
	}
})




let dragging = false
let hovering_drag_destination = null
const drag_destinations = document.getElementsByClassName('drag-destination')
for (const drag_destination of drag_destinations) {
	drag_destination.addEventListener('mouseover',()=>{
		if (dragging) {
			console.log('set drag destination:', drag_destination)
			hovering_drag_destination = drag_destination
		}
	})
}




function create_draggable_image(src){
	const root = document.createElement('img')
	root.className = 'image'
	root.src = src

	root.addEventListener('mousedown',e=>{
		console.log('mouse down')
		e.preventDefault()
		dragging = true
		root.style.position = 'absolute'
		root.style.pointerEvents = 'none'
		
		const end_drag = ()=>{
			window.removeEventListener('mouseup',end_drag)
			window.removeEventListener('mousemove',mouse_move)
			root.style.position = 'unset'
			root.style.pointerEvents = 'auto'
			if (hovering_drag_destination) {
				hovering_drag_destination.appendChild(root)
				hovering_drag_destination = null
			}
			dragging = false
		}
		window.addEventListener('mouseup',end_drag)

		const mouse_move = event=>{
			if (event instanceof MouseEvent) {	
				const x = event.pageX
				const y = event.pageY		
				root.style.top = (y +'px')
				root.style.left = (x +'px')
			}
		}
		window.addEventListener('mousemove',mouse_move)
	})

	return root
}




const color_preset_rows = ['rgb(255, 127, 127)','rgb(255, 191, 127)','rgb(255, 223, 127)','rgb(255, 255, 127)','rgb(191, 255, 127)','rgb(127, 255, 127)','rgb(127, 255, 249)']
const color_preset_columns = ['rgb(255, 127, 251)','rgb(225, 127, 255)','rgb(180, 127, 255)','rgb(133, 127, 255)','rgb(127, 159, 255)','rgb(127, 204, 255)','rgb(127, 255, 249)']

const name_preset_rows = ['S','A','B','C','D','E','F']
const name_preset_columns = ['&omega;','&alpha;','&beta;','&gamma;','&delta;','&epsilon;','&zeta;','&eta;']



//The Grid, as in the area of the grid that is added by the script does not start at 1,1 there are styling elements that and other stuff that push the grid down and right to these two constants below
const grid_wall = 2
const grid_ceiling = 2


const grid_tire_set = new Set()
const grid_slot_set = new Set()
const options_element_set = new Set()
const grid_cells_set = new Set()




const main_grid = document.getElementById('main-grid')
const add_column_button = document.getElementById('add-column-button')
const add_row_button = document.getElementById('add-row-button')
const columns_description_container = document.getElementById('columns-description-container')
const row_description_container = document.getElementById('row-description-container')





function add_row(start_row, columns_amount, start_column, color, text_content) {
	if (typeof columns_amount === 'number' && typeof start_row === 'number' && typeof start_column === 'number') {
		const grid_tier = document.createElement('div')
		grid_tier.className = 'grid-rect grid-tier'
		grid_tier.style.gridRow = `${start_row}/${start_row+1}`
		grid_tier.style.gridColumn = `${start_column}/${start_column+1}`
		grid_tier.style.backgroundColor = color
		grid_tier.innerHTML = `<p class="tier-name-text">${text_content}</p>`
		main_grid.appendChild(grid_tier)
		grid_tire_set.add(grid_tier)

		for (let i = 0; i < columns_amount; i++) {
			const grid_slot = document.createElement('div')
			grid_slot.className = 'grid-rect drag-destination grid-slot'
			grid_slot.style.gridRow = `${start_row}/${start_row+1}`
			grid_slot.style.gridColumn = `${i+start_column+1}/${i+start_column+2}`
			main_grid.appendChild(grid_slot)
			grid_slot_set.add(grid_slot)
		}

		const lane_options = create_lane_options_elements(true)
		lane_options.style.gridRow = `${start_row}/${start_row+1}`
		lane_options.style.gridColumn = `${columns_amount+start_column+1}/${columns_amount+start_column+2}`
		main_grid.appendChild(lane_options)
		options_element_set.add(lane_options)

		add_row_button.style.gridRow = `${start_row+1}/${start_row+2}`
		row_description_container.style.gridRowEnd = start_row+1

		const column_options_elements = document.getElementsByClassName('column-options')
		for (const element of column_options_elements) {
			element.style.gridRow = `${start_row+1}/${start_row+2}`
		}

		grid_tire_set.forEach(element=>grid_cells_set.add(element))
		grid_slot_set.forEach(element=>grid_cells_set.add(element))
		options_element_set.forEach(element=>grid_cells_set.add(element))	
	}
}




function add_column(start_column, rows_amount, start_row, color, text_content) {
	if (typeof rows_amount === 'number' && typeof start_row === 'number' && typeof start_column === 'number') {
		const grid_tier = document.createElement('div')
		grid_tier.className = 'grid-rect grid-tier'
		grid_tier.style.gridColumn = `${start_column}/${start_column+1}`
		grid_tier.style.gridRow = `${start_row}/${start_row+1}`
		grid_tier.style.backgroundColor = color
		grid_tier.innerHTML = `<p class="tier-name-text">${text_content}</p>`
		main_grid.appendChild(grid_tier)
		grid_tire_set.add(grid_tier)

		for (let i = 0; i < rows_amount; i++) {
			const grid_slot = document.createElement('div')
			grid_slot.className = 'grid-rect drag-destination grid-slot'
			grid_slot.style.gridColumn = `${start_column}/${start_column+1}`
			grid_slot.style.gridRow = `${i+start_row+1}/${i+start_row+2}`
			main_grid.appendChild(grid_slot)
			grid_slot_set.add(grid_slot)
		}

		const lane_options = create_lane_options_elements(false)
		lane_options.style.gridColumn = `${start_column}/${start_column+1}`
		lane_options.style.gridRow = `${rows_amount+start_row+1}/${rows_amount+start_row+2}`
		main_grid.appendChild(lane_options)
		options_element_set.add(lane_options)

		add_column_button.style.gridColumn = `${start_column+1}/${start_column+2}`
		columns_description_container.style.gridColumnEnd = start_column+1

		const row_options_elements = document.getElementsByClassName('row-options')
		for (const element of row_options_elements) {
			element.style.gridColumn = `${start_column+1}/${start_column+2}`
		}

		grid_tire_set.forEach(element=>grid_cells_set.add(element))
		grid_slot_set.forEach(element=>grid_cells_set.add(element))
		options_element_set.forEach(element=>grid_cells_set.add(element))
	}
}




function get_grid_area(start_row, start_column, end_row, end_column, elements_to_check) {
	return Array.from(elements_to_check).filter(element=>{
		const style = window.getComputedStyle(element)
		return Number(style.gridRowStart) >= start_row&&
		Number(style.gridRowEnd) <= end_row&&
		Number(style.gridColumnStart) >= start_column&&
		Number(style.gridColumnEnd) <= end_column
	})
}




function remove_row(start_row, start_column) {
	const elements_to_check = Array.from(grid_cells_set)
	const elements_to_remove = get_grid_area(start_row, start_column, start_row+1, Infinity, elements_to_check)
	for (const element of elements_to_remove) {
		grid_tire_set.delete(element)
		grid_slot_set.delete(element)
		options_element_set.delete(element)
		grid_cells_set.delete(element)
		element.remove()
	}
	shift_grid_elements(get_grid_area(start_row+1,1,Infinity,Infinity,Array.from(grid_cells_set)),0,-1)
	row_description_container.style.gridRowEnd = Number(row_description_container.style.gridRowEnd)-1
	rows--
}




function remove_column(start_column, start_row) {
	const elements_to_check = Array.from(grid_cells_set)
	const elements_to_remove = get_grid_area(start_row, start_column, Infinity, start_column+1, elements_to_check)
	for (const element of elements_to_remove) {
		grid_tire_set.delete(element)
		grid_slot_set.delete(element)
		options_element_set.delete(element)
		grid_cells_set.delete(element)
		element.remove()
	}
	shift_grid_elements(get_grid_area(1,start_column+1,Infinity,Infinity,Array.from(grid_cells_set)),-1,0)
	row_description_container.style.gridColumnEnd = Number(row_description_container.style.gridColumnEnd) - 1
	columns--
}




function shift_grid_elements(elements_to_move, x, y) {
	if ((!Array.isArray(elements_to_move))||(!typeof x === 'number')||(!typeof y === 'number')) {
		throw new Error("Invalid parameters");
	}
	for (const element of elements_to_move) {
		if (!element instanceof HTMLElement) {
			throw new Error("Array contains non HTMLElement elements");
		}
		element.style.gridColumnStart = Number(element.style.gridColumnStart) + x
		element.style.gridColumnEnd = Number(element.style.gridColumnEnd) + x
		element.style.gridRowStart = Number(element.style.gridRowStart) + y
		element.style.gridRowEnd = Number(element.style.gridRowEnd) + y
	}
}




function create_lane_options_elements(row=true) {
	//If row is false, assume column
	const root = document.createElement('div')
	root.className = 'grid-rect lane-options'
	root.classList.add(row?'row-options':'column-options')

	const remove_lane_button = document.createElement('button')
	remove_lane_button.className = 'remove-lane-button'
	root.appendChild(remove_lane_button)

	if (row) {
		remove_lane_button.addEventListener('click',()=>{
			remove_row(Number(root.style.gridRowStart),grid_wall)
		})
	} else {
		remove_lane_button.addEventListener('click',()=>{
			remove_column(Number(root.style.gridColumnStart),grid_wall)
		})
	}

	if (row) {
		const shift_row_down_button = document.createElement('button')
		shift_row_down_button.className = 'shift-row-down-button'

		shift_row_down_button.addEventListener('click',()=>{
			const this_row = Number(root.style.gridRowStart)
			const row_below = Number(root.style.gridRowStart)+1
			const elements_on_this_row = get_grid_area(this_row,grid_ceiling,this_row+1,Infinity,Array.from(grid_cells_set))
			const elements_on_row_below = get_grid_area(row_below,grid_ceiling,row_below+1,Infinity,Array.from(grid_cells_set))
			if (elements_on_row_below.filter(e=>e.classList.contains('grid-slot')).length === 0) {
				return
			}
			shift_grid_elements(elements_on_this_row,0,1)
			shift_grid_elements(elements_on_row_below,0,-1)
		})

		root.appendChild(shift_row_down_button)

		const shift_row_up_button = document.createElement('button')
		shift_row_up_button.className = 'shift-row-up-button'

		shift_row_up_button.addEventListener('click',()=>{
			const this_row = Number(root.style.gridRowStart)
			const row_above = Number(root.style.gridRowStart)-1
			const elements_on_this_row = get_grid_area(this_row,2,this_row+1,Infinity,Array.from(grid_cells_set))
			const elements_on_row_above = get_grid_area(row_above,2,row_above+1,Infinity,Array.from(grid_cells_set))
			if (elements_on_row_above.filter(e=>e.classList.contains('grid-slot')).length === 0) {
				return
			}
			shift_grid_elements(elements_on_this_row,0,-1)
			shift_grid_elements(elements_on_row_above,0,1)
		})

		root.appendChild(shift_row_up_button)
	} else {
		const shift_column_right_button = document.createElement('button')
		shift_column_right_button.className = 'shift-column-right-button'
		root.appendChild(shift_column_right_button)

		const shift_column_left_button = document.createElement('button')
		shift_column_left_button.className = 'shift-column-left-button'
		root.appendChild(shift_column_left_button)
	}
	return root
}




add_row(grid_ceiling+1,0,grid_wall, color_preset_rows[0], 'S')
add_row(grid_ceiling+2,0,grid_wall, color_preset_rows[1], 'A')
add_row(grid_ceiling+3,0,grid_wall, color_preset_rows[2], 'B')
add_row(grid_ceiling+4,0,grid_wall, color_preset_rows[3], 'C')
add_row(grid_ceiling+5,0,grid_wall, color_preset_rows[4], 'D')
add_column(grid_wall+1,5,grid_ceiling, color_preset_columns[0], '&omega;')
add_column(grid_wall+2,5,grid_ceiling, color_preset_columns[1], '&alpha;')
add_column(grid_wall+3,5,grid_ceiling, color_preset_columns[2], '&beta;')
add_column(grid_wall+4,5,grid_ceiling, color_preset_columns[3], '&gamma;')
add_column(grid_wall+5,5,grid_ceiling, color_preset_columns[4], '&delta;')

console.log(grid_tire_set, grid_slot_set, options_element_set, grid_cells_set)




let rows = 5
let columns = 5



add_row_button.addEventListener('click',()=>{
	add_row(rows+grid_ceiling+1,columns,grid_wall,color_preset_rows[rows],name_preset_rows[rows])
	rows++
})



add_column_button.addEventListener('click',()=>{
	add_column(columns+grid_ceiling+1,rows,grid_wall,color_preset_columns[columns],name_preset_columns[columns])
	columns++
})


