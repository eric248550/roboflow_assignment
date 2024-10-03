interface ManifestData {
    blocks: Block[];
}

interface Block {
    block_schema: BlockSchema;
    outputs_manifest: OutputsManifest[];
    block_source: string;
    fully_qualified_block_class_name: string;
    human_friendly_block_name: string;
    manifest_type_identifier: string;
    manifest_type_identifier_aliases: string[];
    execution_engine_compatibility: string;
    input_dimensionality_offsets: object;
    dimensionality_reference_property: null;
    output_dimensionality_offset: number;
}

interface BlockSchema {
    additionalProperties: boolean;
    block_type: string;
    license: string;
    long_description: string;
    name: string;
    properties: {
        [key: string]: PropertyValue
    };
    required: string[];
    short_description: string;
    title: string;
    type: string;
    version: string;
}


interface PropertyValue {
    const?: string;
    enum?: string[];
    title?: string;
    type?: string;
    description?: string;
    anyOf?: (AnyOfWithKind | AnyOfWithType)[];
    // different types of values
    examples?: (boolean | string | string[] | number | number[])[];
    kind?: Kind[],
    pattern?: string;
    reference?: boolean;
    selected_element?: string;

    // different types of values
    default?: boolean | string | number | number[];
    ge?: number;
    le?: number;
    // relevant_for?: { predictions: { kind: string[]; required: boolean } };
}

interface AnyOfWithKind {
    kind: Kind[];
    pattern: string;
    reference: boolean;
    selected_element: string;
    type: string;
}
  
interface AnyOfWithType {
    type: string | number;
}

interface OutputsManifest {
    name: string;
    kind: Kind[];
}

interface Kind {
    name: string;
    description: string;
    docs: string;
    serialised_data_type: string;
}

export class Manifest {
    manifestData: ManifestData | null = null;
    manifestUrl: string;

    constructor(manifestUrl: string) {
        this.manifestUrl = manifestUrl;
    }

    // Fetch the manifest data
    async fetchManifest(): Promise<void> {
        const response = await fetch(this.manifestUrl);
        this.manifestData = await response.json() as ManifestData;
    }

    // Get the human readable description for the block
    async getBlockDescription(blockIdentifier: string, fetchUrlAgain: boolean): Promise<string | undefined> {
        if (fetchUrlAgain) await this.fetchManifest(); 
        const block = this.findBlockByIdentifier(blockIdentifier);
        return block?.block_schema?.short_description;
    }

    // Find a block by identifier
    findBlockByIdentifier(blockIdentifier: string): Block | undefined {
        return this.manifestData?.blocks.find(
            (b) => b.manifest_type_identifier === blockIdentifier
        );
    }

    // This return an array properties for the given "blockName" and "kind"
    async getInputPropertiesOfKind(blockIdentifier: string, kind: string, fetchUrlAgain: boolean): Promise<string[]> {
        if (fetchUrlAgain) await this.fetchManifest(); 
        const block = this.findBlockByIdentifier(blockIdentifier);
        if (!block) return [];

        const properties = block.block_schema?.properties;
        return this.findPropertiesOfKind(properties, kind);
    }

    // Find properties of a specific kind
    findPropertiesOfKind(properties: PropertyValue, kind: string): string[] {
        const matchProp: string[] = [];

        for (const [propName, propDetails] of Object.entries(properties)) {
            if (
                propDetails?.kind?.some((k: Kind) => k.name === kind) ||
                propDetails?.anyOf?.some((a: AnyOfWithKind | AnyOfWithType) => {
                    if ("kind" in a) {
                        return a.kind.some((k: Kind) => k.name === kind);
                    }
                    return false;
                })
            ) {
                matchProp.push(propName);
            }
        }
        matchProp.sort();
        return matchProp;
    }
}


// (async () => {
//     const manifestUrl = 'https://detect.roboflow.com/workflows/blocks/describe';
//     const manifest = new Manifest(manifestUrl);
  
//     const description = await manifest.getBlockDescription("roboflow_core/roboflow_object_detection_model@v1");
//     console.log(description);
  
//     const inputProps = await manifest.getInputPropertiesOfKind("roboflow_core/roboflow_object_detection_model@v1", "image");
//     console.log(inputProps);
// })();