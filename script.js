


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




function create_draggable_image(src){
	const root = document.createElement('img')
	root.className = 'image'
	root.src = src

	root.addEventListener('mousedown',()=>{
		console.log('mouse down')
		const return_element = root.parentElement
		root.style.position = 'absolute'
		root.style.pointerEvents = 'none'
		
		const end_drag = ()=>{
			window.removeEventListener('mouseup',end_drag)
			window.removeEventListener('mousemove',mouse_move)
			root.style.position = 'unset'
			root.style.pointerEvents = 'auto'
		}
		window.addEventListener('mouseup',end_drag)

		const mouse_move = event=>{
			if (event instanceof MouseEvent) {	
				const x = event.pageX
				const y = event.pageY		
				console.log(x, y)
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
