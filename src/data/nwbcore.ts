import * as Spec from "../nwb/spec";
function coreQuery(id: string): Spec.CoreType {
  const catalog: { [keyof: string]: Spec.CoreType } = {
    ImagingRetinotopy: [
      "GROUP",
      {
        neurodataTypeDef: "ImagingRetinotopy",
        name: ["ImagingRetinotopy", true],
        doc: "Intrinsic signal optical imaging or widefield imaging for measuring retinotopy. Stores orthogonal maps (e.g., altitude/azimuth; radius/theta) of responses to specific stimuli and a combined polarity map from which to identify visual areas. This group does not store the raw responses imaged during retinotopic mapping or the stimuli presented, but rather the resulting phase and power maps after applying a Fourier transform on the averaged responses. Note: for data consistency, all images and arrays are stored in the format [row][column] and [row, col], which equates to [y][x]. Field of view and dimension arrays may appear backward (i.e., y before x).",
      },
    ],
    PatchClampSeries: [
      "GROUP",
      {
        neurodataTypeDef: "PatchClampSeries",
        name: ["", false],
        doc: "An abstract base class for patch-clamp data - stimulus or response, current or voltage.",
      },
    ],
    CurrentClampSeries: [
      "GROUP",
      {
        neurodataTypeDef: "CurrentClampSeries",
        name: ["", false],
        doc: "Voltage data from an intracellular current-clamp recording. A corresponding CurrentClampStimulusSeries (stored separately as a stimulus) is used to store the current injected.",
      },
    ],
    IZeroClampSeries: [
      "GROUP",
      {
        neurodataTypeDef: "IZeroClampSeries",
        name: ["", false],
        doc: "Voltage data from an intracellular recording when all current and amplifier settings are off (i.e., CurrentClampSeries fields will be zero). There is no CurrentClampStimulusSeries associated with an IZero series because the amplifier is disconnected and no stimulus can reach the cell.",
      },
    ],
    CurrentClampStimulusSeries: [
      "GROUP",
      {
        neurodataTypeDef: "CurrentClampStimulusSeries",
        name: ["", false],
        doc: "Stimulus current applied during current clamp recording.",
      },
    ],
    VoltageClampSeries: [
      "GROUP",
      {
        neurodataTypeDef: "VoltageClampSeries",
        name: ["", false],
        doc: "Current data from an intracellular voltage-clamp recording. A corresponding VoltageClampStimulusSeries (stored separately as a stimulus) is used to store the voltage injected.",
      },
    ],
    VoltageClampStimulusSeries: [
      "GROUP",
      {
        neurodataTypeDef: "VoltageClampStimulusSeries",
        name: ["", false],
        doc: "Stimulus voltage applied during a voltage clamp recording.",
      },
    ],
    IntracellularElectrode: [
      "GROUP",
      {
        neurodataTypeDef: "IntracellularElectrode",
        name: ["", false],
        doc: "An intracellular electrode and its metadata.",
      },
    ],
    SweepTable: [
      "GROUP",
      {
        neurodataTypeDef: "SweepTable",
        name: ["", false],
        doc: "[DEPRECATED] Table used to group different PatchClampSeries. SweepTable is being replaced by IntracellularRecordingsTable and SimultaneousRecordingsTable tables. Additional SequentialRecordingsTable, RepetitionsTable, and ExperimentalConditions tables provide enhanced support for experiment metadata.",
      },
    ],
    IntracellularElectrodesTable: [
      "GROUP",
      {
        neurodataTypeDef: "IntracellularElectrodesTable",
        name: ["", false],
        doc: "Table for storing intracellular electrode related metadata.",
      },
    ],
    IntracellularStimuliTable: [
      "GROUP",
      {
        neurodataTypeDef: "IntracellularStimuliTable",
        name: ["", false],
        doc: "Table for storing intracellular stimulus related metadata.",
      },
    ],
    IntracellularResponsesTable: [
      "GROUP",
      {
        neurodataTypeDef: "IntracellularResponsesTable",
        name: ["", false],
        doc: "Table for storing intracellular response related metadata.",
      },
    ],
    IntracellularRecordingsTable: [
      "GROUP",
      {
        neurodataTypeDef: "IntracellularRecordingsTable",
        name: ["intracellular_recordings", false],
        doc: "A table to group together a stimulus and response from a single electrode and a single simultaneous recording. Each row in the table represents a single recording consisting typically of a stimulus and a corresponding response. In some cases, however, only a stimulus or a response is recorded as part of an experiment. In this case, both the stimulus and response will point to the same TimeSeries while the idx_start and count of the invalid column will be set to -1, thus, indicating that no values have been recorded for the stimulus or response, respectively. Note, a recording MUST contain at least a stimulus or a response. Typically the stimulus and response are PatchClampSeries. However, the use of AD/DA channels that are not associated to an electrode is also common in intracellular electrophysiology, in which case other TimeSeries may be used.",
      },
    ],
    SimultaneousRecordingsTable: [
      "GROUP",
      {
        neurodataTypeDef: "SimultaneousRecordingsTable",
        name: ["simultaneous_recordings", false],
        doc: "A table for grouping different intracellular recordings from the IntracellularRecordingsTable table together that were recorded simultaneously from different electrodes.",
      },
    ],
    SequentialRecordingsTable: [
      "GROUP",
      {
        neurodataTypeDef: "SequentialRecordingsTable",
        name: ["sequential_recordings", false],
        doc: "A table for grouping different sequential recordings from the SimultaneousRecordingsTable table together. This is typically used to group together sequential recordings where a sequence of stimuli of the same type with varying parameters have been presented in a sequence.",
      },
    ],
    RepetitionsTable: [
      "GROUP",
      {
        neurodataTypeDef: "RepetitionsTable",
        name: ["repetitions", false],
        doc: "A table for grouping different sequential intracellular recordings together. With each SequentialRecording typically representing a particular type of stimulus, the RepetitionsTable table is typically used to group sets of stimuli applied in sequence.",
      },
    ],
    ExperimentalConditionsTable: [
      "GROUP",
      {
        neurodataTypeDef: "ExperimentalConditionsTable",
        name: ["experimental_conditions", false],
        doc: "A table for grouping different intracellular recording repetitions together that belong to the same experimental condition.",
      },
    ],
    SpatialSeries: [
      "GROUP",
      {
        neurodataTypeDef: "SpatialSeries",
        name: ["", false],
        doc: "Direction, e.g., of gaze or travel, or position. The TimeSeries::data field is a 2D array storing position or direction relative to some reference frame. Array structure: [num measurements] [num dimensions]. Each SpatialSeries has a text dataset reference_frame that indicates the zero-position, or the zero-axes for direction. For example, if representing gaze direction, 'straight-ahead' might be a specific pixel on the monitor, or some other point in space. For position data, the 0,0 point might be the top-left corner of an enclosure, as viewed from the tracking camera. The unit of data will indicate how to interpret SpatialSeries values.",
      },
    ],
    BehavioralEpochs: [
      "GROUP",
      {
        neurodataTypeDef: "BehavioralEpochs",
        name: ["BehavioralEpochs", true],
        doc: "TimeSeries for storing behavioral epochs.  The objective of this and the other two Behavioral interfaces (e.g. BehavioralEvents and BehavioralTimeSeries) is to provide generic hooks for software tools/scripts. This allows a tool/script to take the output one specific interface (e.g., UnitTimes) and plot that data relative to another data modality (e.g., behavioral events) without having to define all possible modalities in advance. Declaring one of these interfaces means that one or more TimeSeries of the specified type is published. These TimeSeries should reside in a group having the same name as the interface. For example, if a BehavioralTimeSeries interface is declared, the module will have one or more TimeSeries defined in the module sub-group 'BehavioralTimeSeries'. BehavioralEpochs should use IntervalSeries. BehavioralEvents is used for irregular events. BehavioralTimeSeries is for continuous data.",
      },
    ],
    BehavioralEvents: [
      "GROUP",
      {
        neurodataTypeDef: "BehavioralEvents",
        name: ["BehavioralEvents", true],
        doc: 'TimeSeries for storing behavioral events. See description of <a href="#BehavioralEpochs">BehavioralEpochs</a> for more details.',
      },
    ],
    BehavioralTimeSeries: [
      "GROUP",
      {
        neurodataTypeDef: "BehavioralTimeSeries",
        name: ["BehavioralTimeSeries", true],
        doc: 'TimeSeries for storing Behavoioral time series data. See description of <a href="#BehavioralEpochs">BehavioralEpochs</a> for more details.',
      },
    ],
    PupilTracking: [
      "GROUP",
      {
        neurodataTypeDef: "PupilTracking",
        name: ["PupilTracking", true],
        doc: "Eye-tracking data, representing pupil size.",
      },
    ],
    EyeTracking: [
      "GROUP",
      {
        neurodataTypeDef: "EyeTracking",
        name: ["EyeTracking", true],
        doc: "Eye-tracking data, representing direction of gaze.",
      },
    ],
    CompassDirection: [
      "GROUP",
      {
        neurodataTypeDef: "CompassDirection",
        name: ["CompassDirection", true],
        doc: "With a CompassDirection interface, a module publishes a SpatialSeries object representing a floating point value for theta. The SpatialSeries::reference_frame field should indicate what direction corresponds to 0 and which is the direction of rotation (this should be clockwise). The si_unit for the SpatialSeries should be radians or degrees.",
      },
    ],
    Position: [
      "GROUP",
      {
        neurodataTypeDef: "Position",
        name: ["Position", true],
        doc: "Position data, whether along the x, x/y or x/y/z axis.",
      },
    ],
    AbstractFeatureSeries: [
      "GROUP",
      {
        neurodataTypeDef: "AbstractFeatureSeries",
        name: ["", false],
        doc: "Abstract features, such as quantitative descriptions of sensory stimuli. The TimeSeries::data field is a 2D array, storing those features (e.g., for visual grating stimulus this might be orientation, spatial frequency and contrast). Null stimuli (eg, uniform gray) can be marked as being an independent feature (eg, 1.0 for gray, 0.0 for actual stimulus) or by storing NaNs for feature values, or through use of the TimeSeries::control fields. A set of features is considered to persist until the next set of features is defined. The final set of features stored should be the null set. This is useful when storing the raw stimulus is impractical.",
      },
    ],
    AnnotationSeries: [
      "GROUP",
      {
        neurodataTypeDef: "AnnotationSeries",
        name: ["", false],
        doc: "Stores user annotations made during an experiment. The data[] field stores a text array, and timestamps are stored for each annotation (ie, interval=1). This is largely an alias to a standard TimeSeries storing a text array but that is identifiable as storing annotations in a machine-readable way.",
      },
    ],
    IntervalSeries: [
      "GROUP",
      {
        neurodataTypeDef: "IntervalSeries",
        name: ["", false],
        doc: "Stores intervals of data. The timestamps field stores the beginning and end of intervals. The data field stores whether the interval just started (>0 value) or ended (<0 value). Different interval types can be represented in the same series by using multiple key values (eg, 1 for feature A, 2 for feature B, 3 for feature C, etc). The field data stores an 8-bit integer. This is largely an alias of a standard TimeSeries but that is identifiable as representing time intervals in a machine-readable way.",
      },
    ],
    DecompositionSeries: [
      "GROUP",
      {
        neurodataTypeDef: "DecompositionSeries",
        name: ["", false],
        doc: "Spectral analysis of a time series, e.g. of an LFP or a speech signal.",
      },
    ],
    Units: [
      "GROUP",
      {
        neurodataTypeDef: "Units",
        name: ["Units", true],
        doc: "Data about spiking units. Event times of observed units (e.g. cell, synapse, etc.) should be concatenated and stored in spike_times.",
      },
    ],
    NWBFile: [
      "GROUP",
      {
        neurodataTypeDef: "NWBFile",
        name: ["root", false],
        doc: "An NWB file storing cellular-based neurophysiology data from a single experimental session.",
      },
    ],
    LabMetaData: [
      "GROUP",
      {
        neurodataTypeDef: "LabMetaData",
        name: ["", false],
        doc: "Lab-specific meta-data.",
      },
    ],
    Subject: [
      "GROUP",
      {
        neurodataTypeDef: "Subject",
        name: ["", false],
        doc: "Information about the animal or person from which the data was measured.",
      },
    ],
    ScratchData: [
      "DATASET",
      {
        neurodataTypeDef: "ScratchData",
        name: ["", false],
        doc: "Any one-off datasets",
        shape: [],
        dtype: ["PRIMITIVE", "Any"],
      },
    ],
    OnePhotonSeries: [
      "GROUP",
      {
        neurodataTypeDef: "OnePhotonSeries",
        name: ["", false],
        doc: "Image stack recorded over time from 1-photon microscope.",
      },
    ],
    TwoPhotonSeries: [
      "GROUP",
      {
        neurodataTypeDef: "TwoPhotonSeries",
        name: ["", false],
        doc: "Image stack recorded over time from 2-photon microscope.",
      },
    ],
    RoiResponseSeries: [
      "GROUP",
      {
        neurodataTypeDef: "RoiResponseSeries",
        name: ["", false],
        doc: "ROI responses over an imaging plane. The first dimension represents time. The second dimension, if present, represents ROIs.",
      },
    ],
    DfOverF: [
      "GROUP",
      {
        neurodataTypeDef: "DfOverF",
        name: ["DfOverF", true],
        doc: "dF/F information about a region of interest (ROI). Storage hierarchy of dF/F should be the same as for segmentation (i.e., same names for ROIs and for image planes).",
      },
    ],
    Fluorescence: [
      "GROUP",
      {
        neurodataTypeDef: "Fluorescence",
        name: ["Fluorescence", true],
        doc: "Fluorescence information about a region of interest (ROI). Storage hierarchy of fluorescence should be the same as for segmentation (ie, same names for ROIs and for image planes).",
      },
    ],
    ImageSegmentation: [
      "GROUP",
      {
        neurodataTypeDef: "ImageSegmentation",
        name: ["ImageSegmentation", true],
        doc: "Stores pixels in an image that represent different regions of interest (ROIs) or masks. All segmentation for a given imaging plane is stored together, with storage for multiple imaging planes (masks) supported. Each ROI is stored in its own subgroup, with the ROI group containing both a 2D mask and a list of pixels that make up this mask. Segments can also be used for masking neuropil. If segmentation is allowed to change with time, a new imaging plane (or module) is required and ROI names should remain consistent between them.",
      },
    ],
    PlaneSegmentation: [
      "GROUP",
      {
        neurodataTypeDef: "PlaneSegmentation",
        name: ["", false],
        doc: "Results from image segmentation of a specific imaging plane.",
      },
    ],
    ImagingPlane: [
      "GROUP",
      {
        neurodataTypeDef: "ImagingPlane",
        name: ["", false],
        doc: "An imaging plane and its metadata.",
      },
    ],
    OpticalChannel: [
      "GROUP",
      {
        neurodataTypeDef: "OpticalChannel",
        name: ["", false],
        doc: "An optical channel used to record from an imaging plane.",
      },
    ],
    MotionCorrection: [
      "GROUP",
      {
        neurodataTypeDef: "MotionCorrection",
        name: ["MotionCorrection", true],
        doc: "An image stack where all frames are shifted (registered) to a common coordinate system, to account for movement and drift between frames. Note: each frame at each point in time is assumed to be 2-D (has only x & y dimensions).",
      },
    ],
    CorrectedImageStack: [
      "GROUP",
      {
        neurodataTypeDef: "CorrectedImageStack",
        name: ["", false],
        doc: "Reuslts from motion correction of an image stack.",
      },
    ],
    ElectricalSeries: [
      "GROUP",
      {
        neurodataTypeDef: "ElectricalSeries",
        name: ["", false],
        doc: "A time series of acquired voltage data from extracellular recordings. The data field is an int or float array storing data in volts. The first dimension should always represent time. The second dimension, if present, should represent channels.",
      },
    ],
    SpikeEventSeries: [
      "GROUP",
      {
        neurodataTypeDef: "SpikeEventSeries",
        name: ["", false],
        doc: "Stores snapshots/snippets of recorded spike events (i.e., threshold crossings). This may also be raw data, as reported by ephys hardware. If so, the TimeSeries::description field should describe how events were detected. All SpikeEventSeries should reside in a module (under EventWaveform interface) even if the spikes were reported and stored by hardware. All events span the same recording channels and store snapshots of equal duration. TimeSeries::data array structure: [num events] [num channels] [num samples] (or [num events] [num samples] for single electrode).",
      },
    ],
    FeatureExtraction: [
      "GROUP",
      {
        neurodataTypeDef: "FeatureExtraction",
        name: ["FeatureExtraction", true],
        doc: "Features, such as PC1 and PC2, that are extracted from signals stored in a SpikeEventSeries or other source.",
      },
    ],
    EventDetection: [
      "GROUP",
      {
        neurodataTypeDef: "EventDetection",
        name: ["EventDetection", true],
        doc: "Detected spike events from voltage trace(s).",
      },
    ],
    EventWaveform: [
      "GROUP",
      {
        neurodataTypeDef: "EventWaveform",
        name: ["EventWaveform", true],
        doc: "Represents either the waveforms of detected events, as extracted from a raw data trace in /acquisition, or the event waveforms that were stored during experiment acquisition.",
      },
    ],
    FilteredEphys: [
      "GROUP",
      {
        neurodataTypeDef: "FilteredEphys",
        name: ["FilteredEphys", true],
        doc: "Electrophysiology data from one or more channels that has been subjected to filtering. Examples of filtered data include Theta and Gamma (LFP has its own interface). FilteredEphys modules publish an ElectricalSeries for each filtered channel or set of channels. The name of each ElectricalSeries is arbitrary but should be informative. The source of the filtered data, whether this is from analysis of another time series or as acquired by hardware, should be noted in each's TimeSeries::description field. There is no assumed 1::1 correspondence between filtered ephys signals and electrodes, as a single signal can apply to many nearby electrodes, and one electrode may have different filtered (e.g., theta and/or gamma) signals represented. Filter properties should be noted in the ElectricalSeries 'filtering' attribute.",
      },
    ],
    LFP: [
      "GROUP",
      {
        neurodataTypeDef: "LFP",
        name: ["LFP", true],
        doc: "LFP data from one or more channels. The electrode map in each published ElectricalSeries will identify which channels are providing LFP data. Filter properties should be noted in the ElectricalSeries 'filtering' attribute.",
      },
    ],
    ElectrodeGroup: [
      "GROUP",
      {
        neurodataTypeDef: "ElectrodeGroup",
        name: ["", false],
        doc: "A physical grouping of electrodes, e.g. a shank of an array.",
      },
    ],
    ClusterWaveforms: [
      "GROUP",
      {
        neurodataTypeDef: "ClusterWaveforms",
        name: ["ClusterWaveforms", true],
        doc: "DEPRECATED The mean waveform shape, including standard deviation, of the different clusters. Ideally, the waveform analysis should be performed on data that is only high-pass filtered. This is a separate module because it is expected to require updating. For example, IMEC probes may require different storage requirements to store/display mean waveforms, requiring a new interface or an extension of this one.",
      },
    ],
    Clustering: [
      "GROUP",
      {
        neurodataTypeDef: "Clustering",
        name: ["Clustering", true],
        doc: "DEPRECATED Clustered spike data, whether from automatic clustering tools (e.g., klustakwik) or as a result of manual sorting.",
      },
    ],
    ImageSeries: [
      "GROUP",
      {
        neurodataTypeDef: "ImageSeries",
        name: ["", false],
        doc: "General image data that is common between acquisition and stimulus time series. Sometimes the image data is stored in the file in a raw format while other times it will be stored as a series of external image files in the host file system. The data field will either be binary data, if the data is stored in the NWB file, or empty, if the data is stored in an external image stack. [frame][x][y] or [frame][x][y][z].",
      },
    ],
    ImageMaskSeries: [
      "GROUP",
      {
        neurodataTypeDef: "ImageMaskSeries",
        name: ["", false],
        doc: "An alpha mask that is applied to a presented visual stimulus. The 'data' array contains an array of mask values that are applied to the displayed image. Mask values are stored as RGBA. Mask can vary with time. The timestamps array indicates the starting time of a mask, and that mask pattern continues until it's explicitly changed.",
      },
    ],
    OpticalSeries: [
      "GROUP",
      {
        neurodataTypeDef: "OpticalSeries",
        name: ["", false],
        doc: "Image data that is presented or recorded. A stimulus template movie will be stored only as an image. When the image is presented as stimulus, additional data is required, such as field of view (e.g., how much of the visual field the image covers, or how what is the area of the target being imaged). If the OpticalSeries represents acquired imaging data, orientation is also important.",
      },
    ],
    IndexSeries: [
      "GROUP",
      {
        neurodataTypeDef: "IndexSeries",
        name: ["", false],
        doc: "Stores indices to image frames stored in an ImageSeries. The purpose of the IndexSeries is to allow a static image stack to be stored in an Images object, and the images in the stack to be referenced out-of-order. This can be for the display of individual images, or of movie segments (as a movie is simply a series of images). The data field stores the index of the frame in the referenced Images object, and the timestamps array indicates when that image was displayed.",
      },
    ],
    GrayscaleImage: [
      "DATASET",
      {
        neurodataTypeDef: "GrayscaleImage",
        name: ["", false],
        doc: "A grayscale image.",
        shape: [
          [
            ["None", "x"],
            ["None", "y"],
          ],
        ],
        dtype: ["PRIMITIVE", "Numeric"],
      },
    ],
    RGBImage: [
      "DATASET",
      {
        neurodataTypeDef: "RGBImage",
        name: ["", false],
        doc: "A color image.",
        shape: [
          [
            ["None", "x"],
            ["None", "y"],
            [3, "r, g, b"],
          ],
        ],
        dtype: ["PRIMITIVE", "Numeric"],
      },
    ],
    RGBAImage: [
      "DATASET",
      {
        neurodataTypeDef: "RGBAImage",
        name: ["", false],
        doc: "A color image with transparency.",
        shape: [
          [
            ["None", "x"],
            ["None", "y"],
            [4, "r, g, b, a"],
          ],
        ],
        dtype: ["PRIMITIVE", "Numeric"],
      },
    ],
    OptogeneticSeries: [
      "GROUP",
      {
        neurodataTypeDef: "OptogeneticSeries",
        name: ["", false],
        doc: "An optogenetic stimulus.",
      },
    ],
    OptogeneticStimulusSite: [
      "GROUP",
      {
        neurodataTypeDef: "OptogeneticStimulusSite",
        name: ["", false],
        doc: "A site of optogenetic stimulation.",
      },
    ],
    TimeIntervals: [
      "GROUP",
      {
        neurodataTypeDef: "TimeIntervals",
        name: ["", false],
        doc: "A container for aggregating epoch data and the TimeSeries that each epoch applies to.",
      },
    ],
    Device: [
      "GROUP",
      {
        neurodataTypeDef: "Device",
        name: ["", false],
        doc: "Metadata about a data acquisition device, e.g., recording system, electrode, microscope.",
      },
    ],
    NWBContainer: [
      "GROUP",
      {
        neurodataTypeDef: "NWBContainer",
        name: ["", false],
        doc: "An abstract data type for a generic container storing collections of data and metadata. Base type for all data and metadata containers.",
      },
    ],
    NWBDataInterface: [
      "GROUP",
      {
        neurodataTypeDef: "NWBDataInterface",
        name: ["", false],
        doc: "An abstract data type for a generic container storing collections of data, as opposed to metadata.",
      },
    ],
    TimeSeries: [
      "GROUP",
      {
        neurodataTypeDef: "TimeSeries",
        name: ["", false],
        doc: "General purpose time series.",
      },
    ],
    ProcessingModule: [
      "GROUP",
      {
        neurodataTypeDef: "ProcessingModule",
        name: ["", false],
        doc: "A collection of processed data.",
      },
    ],
    Images: [
      "GROUP",
      {
        neurodataTypeDef: "Images",
        name: ["Images", true],
        doc: 'A collection of images with an optional way to specify the order of the images using the "order_of_images" dataset. An order must be specified if the images are referenced by index, e.g., from an IndexSeries.',
      },
    ],
    NWBData: [
      "DATASET",
      {
        neurodataTypeDef: "NWBData",
        name: ["", false],
        doc: "An abstract data type for a dataset.",
        shape: [],
        dtype: ["PRIMITIVE", "Any"],
      },
    ],
    TimeSeriesReferenceVectorData: [
      "DATASET",
      {
        neurodataTypeDef: "TimeSeriesReferenceVectorData",
        name: ["timeseries", true],
        doc: "Column storing references to a TimeSeries (rows). For each TimeSeries this VectorData column stores the start_index and count to indicate the range in time to be selected as well as an object reference to the TimeSeries.",
        shape: [],
        dtype: [
          "COMPOUND",
          [
            {
              name: "idx_start",
              doc: "Start index into the TimeSeries 'data' and 'timestamp' datasets of the referenced TimeSeries. The first dimension of those arrays is always time.",
              dtype: ["PRIMITIVE", "i32"],
            },
            {
              name: "count",
              doc: "Number of data samples available in this time series, during this epoch",
              dtype: ["PRIMITIVE", "i32"],
            },
            {
              name: "timeseries",
              doc: "The TimeSeries that this index applies to",
              dtype: ["REFSPEC", ["CORE", coreQuery("TimeSeries")]],
            },
          ],
        ],
      },
    ],
    Image: [
      "DATASET",
      {
        neurodataTypeDef: "Image",
        name: ["", false],
        doc: "An abstract data type for an image. Shape can be 2-D (x, y), or 3-D where the third dimension can have three or four elements, e.g. (x, y, (r, g, b)) or (x, y, (r, g, b, a)).",
        shape: [
          [
            ["None", "x"],
            ["None", "y"],
          ],
          [
            ["None", "x"],
            ["None", "y"],
            [3, "r, g, b"],
          ],
          [
            ["None", "x"],
            ["None", "y"],
            [4, "r, g, b, a"],
          ],
        ],
        dtype: ["PRIMITIVE", "Numeric"],
      },
    ],
    ImageReferences: [
      "DATASET",
      {
        neurodataTypeDef: "ImageReferences",
        name: ["", false],
        doc: "Ordered dataset of references to Image objects.",
        shape: [[["None", "num_images"]]],
        dtype: ["REFSPEC", ["CORE", coreQuery("Image")]],
      },
    ],
  };
  return catalog[id];
}