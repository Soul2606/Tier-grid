


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




const color_preset_rows = ['rgb(255, 127, 127)','rgb(255, 191, 127)','rgb(255, 223, 127)','rgb(255, 255, 127)','rgb(191, 255, 127)','rgb(127, 255, 127)']
const color_preset_columns = ['rgb(255, 127, 251)','rgb(225, 127, 255)','rgb(180, 127, 255)','rgb(133, 127, 255)','rgb(127, 159, 255)','rgb(127, 204, 255)']




const main_grid = document.getElementById('main-grid')
const add_column_button = document.getElementById('add-column-button')
const add_row_button = document.getElementById('add-row-button')
const columns_description_container = document.getElementById('columns-description-container')
const row_description_container = document.getElementById('row-description-container')





function add_row(start_row, columns_amount, start_column, color, text_content) {
	if (typeof columns_amount === 'number' && typeof start_row === 'number' && typeof start_column === 'number') {
		const grid_tier = document.createElement('div')
		grid_tier.className = 'grid-slot grid-tier'
		grid_tier.style.gridRow = `${start_row}/${start_row+1}`
		grid_tier.style.gridColumn = `${start_column}/${start_column+1}`
		grid_tier.style.backgroundColor = color
		grid_tier.innerHTML = `<p class="tier-name-text">${text_content}</p>`

		main_grid.appendChild(grid_tier)
		for (let i = 0; i < columns_amount; i++) {
			const grid_slot = document.createElement('div')
			grid_slot.className = 'grid-slot drag-destination'
			grid_slot.style.gridRow = `${start_row}/${start_row+1}`
			grid_slot.style.gridColumn = `${i+start_column+1}/${i+start_column+2}`
			main_grid.appendChild(grid_slot)
		}

		const lane_options = document.createElement('div')
		lane_options.className = 'grid-slot row-options'
		lane_options.style.gridRow = `${start_row}/${start_row+1}`
		lane_options.style.gridColumn = `${columns_amount+start_column+1}/${columns_amount+start_column+2}`
		main_grid.appendChild(lane_options)

		add_row_button.style.gridRow = `${start_row+1}/${start_row+2}`
		row_description_container.style.gridRowEnd = start_row+1

		const column_options_elements = document.getElementsByClassName('column-options')
		for (const element of column_options_elements) {
			element.style.gridRow `${start_row+1}/${start_row+2}`
		}
	}
}




function add_column(start_column, rows_amount, start_row, color, text_content) {
	if (typeof rows_amount === 'number' && typeof start_row === 'number' && typeof start_column === 'number') {
		const grid_tier = document.createElement('div')
		grid_tier.className = 'grid-slot grid-tier'
		grid_tier.style.gridColumn = `${start_column}/${start_column+1}`
		grid_tier.style.gridRow = `${start_row}/${start_row+1}`
		grid_tier.style.backgroundColor = color
		grid_tier.innerHTML = `<p class="tier-name-text">${text_content}</p>`

		main_grid.appendChild(grid_tier)
		for (let i = 0; i < rows_amount; i++) {
			const grid_slot = document.createElement('div')
			grid_slot.className = 'grid-slot drag-destination'
			grid_slot.style.gridColumn = `${start_column}/${start_column+1}`
			grid_slot.style.gridRow = `${i+start_row+1}/${i+start_row+2}`
			main_grid.appendChild(grid_slot)
		}

		const lane_options = document.createElement('div')
		lane_options.className = 'grid-slot column-options'
		lane_options.style.gridColumn = `${start_column}/${start_column+1}`
		lane_options.style.gridRow = `${rows_amount+start_row+1}/${rows_amount+start_row+2}`
		main_grid.appendChild(lane_options)

		add_column_button.style.gridColumn = `${start_column+1}/${start_column+2}`
		columns_description_container.style.gridColumnEnd = start_column+1

		const row_options_elements = document.getElementsByClassName('row-options')
		for (const element of row_options_elements) {
			element.style.gridColumn = `${start_column+1}/${start_column+2}`
		}
	}
}




add_row(3,0,2, color_preset_rows[0], 'S')
add_row(4,0,2, color_preset_rows[1], 'A')
add_row(5,0,2, color_preset_rows[2], 'B')
add_row(6,0,2, color_preset_rows[3], 'C')
add_column(3,4,2, color_preset_columns[0], '&omega;')
add_column(4,4,2, color_preset_columns[1], '&alpha;')
add_column(5,4,2, color_preset_columns[2], '&beta;')
add_column(6,4,2, color_preset_columns[3], '&gamma;')





