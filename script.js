


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



function add_row(row, columns, start_column) {
	if (typeof columns === 'number' && typeof row === 'number' && typeof start_column === 'number') {
		const grid_tier = document.createElement('div')
		grid_tier.className = 'grid-slot grid-tier'
		grid_tier.style.gridRow = `${row}/${row+1}`
		grid_tier.style.gridColumn = `${start_column}/${start_column+1}`
		main_grid.appendChild(grid_tier)
		for (let i = 0; i < columns; i++) {
			const grid_slot = document.createElement('div')
			grid_slot.className = 'grid-slot drag-destination'
			grid_slot.style.gridRow = `${row}/${row+1}`
			grid_slot.style.gridColumn = `${i+start_column+1}/${i+start_column+2}`
			main_grid.appendChild(grid_slot)
		}
		const lane_options = document.createElement('div')
		lane_options.className = 'grid-slot lane-options'
		lane_options.style.gridRow = `${row}/${row+1}`
		lane_options.style.gridColumn = `${columns+start_column+1}/${columns+start_column+2}`
		main_grid.appendChild(lane_options)

		add_row_button.style.gridRow = `${row+1}/${row+2}`
	}
}


add_row(8,5,2)





