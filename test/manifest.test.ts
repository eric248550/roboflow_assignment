import { Manifest } from '../src/manifest';

describe('Manifest Class', () => {
	let manifest: Manifest;

	beforeEach(async () => {
		manifest = new Manifest('https://detect.roboflow.com/workflows/blocks/describe');
		// save the test time
		await manifest.fetchManifest();
	});

	it("can get description of block", async () => {
		const desc = await manifest.getBlockDescription("roboflow_core/roboflow_object_detection_model@v1", false);
		expect(desc).toEqual("Predict the location of objects with bounding boxes.");


		const desc2 = await manifest.getBlockDescription("roboflow_core/polygon_visualization@v1", false);
		expect(desc2).toEqual("Draws a polygon around detected objects in an image.");
	});

	it("can get input properties of a specified kind for a block type", async () => {
		const inputProps = await manifest.getInputPropertiesOfKind(
			"roboflow_core/roboflow_object_detection_model@v1",
			"image",
			false
		);
		expect(inputProps).toEqual(["images"]);


		const inputProps2 = await manifest.getInputPropertiesOfKind(
			"roboflow_core/polygon_visualization@v1",
			"string",
			false
		);
		expect(inputProps2).toEqual(["color_axis", "color_palette"]);


		const inputProps3 = await manifest.getInputPropertiesOfKind(
			"roboflow_core/dynamic_crop@v1",
			"object_detection_prediction",
			false
		);
		expect(inputProps3).toEqual(["predictions"]);
	});
});