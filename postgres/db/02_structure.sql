CREATE DATABASE smartfactory;
\c smartfactory

/* Material */
CREATE TABLE material (
  id SERIAL,
  name character varying(20) NOT NULL,
  description character varying(50) NOT NULL,
  description_optional character varying(50) NULL,
  unit_of_measure character varying(10) NOT NULL
);

ALTER TABLE material ADD CONSTRAINT material_pkey PRIMARY KEY (id);

/* Equipment */
CREATE TABLE equipment (
  site character varying(50) NULL,
  area character varying(50) NULL,
  production_line character varying(50) NULL,
  equipment character varying(50) NULL,
  start_time character varying(10) NULL
);

/* Material Requirement */
CREATE TABLE material_requirement (
  product_id character varying(20) NOT NULL,
  material_id integer NOT NULL,
  operation_id integer NOT NULL,
  route_id integer NULL,
  quantity double precision NOT NULL,
  grams_on_scale double precision NOT NULL,
  grams_total double precision NOT NULL,
  quantity_uom character varying(20) NULL,
  sub_sequence_id integer NOT NULL
);

/* Operation */
CREATE TABLE operation (
  id SERIAL,
  name character varying(20) NOT NULL,
  sequence integer NOT NULL,
  UNIQUE(sequence)
);

ALTER TABLE operation ADD CONSTRAINT operation_pkey PRIMARY KEY (id);

/* Order State */
CREATE TABLE order_state (
  state character varying NOT NULL,
  state_options character varying[] NOT NULL,
  is_unique boolean NOT NULL,
  is_init_state boolean NOT NULL,
  backup_state character varying NULL
);

/* Process Control Form */
CREATE TABLE process_control_form (
  id character varying NOT NULL,
  order_id character varying NOT NULL,
  product_id character varying NOT NULL,
  product_description character varying NOT NULL,
  production_line character varying NOT NULL,
  qa_form jsonb NOT NULL,
  reviewed_at timestamp with time zone NOT NULL,
  reviewed_by character varying NOT NULL,
  comment character varying NOT NULL,
  line_lead_form jsonb NOT NULL,
  order_created_at timestamp with time zone NOT NULL,
  checked_by character varying NOT NULL,
  num_out_of_range integer NOT NULL,
  num_of_check integer NOT NULL
);

ALTER TABLE process_control_form ADD CONSTRAINT process_control_form_pkey PRIMARY KEY (id);

/* Product */
CREATE TABLE product (
  id character varying(20) NOT NULL,
  ingredient jsonb NOT NULL,
  comment character varying(255) NULL,
  product_group character varying(50) NOT NULL,
  product_desc character varying(50) NOT NULL
);

/* Product Group */
CREATE TABLE product_group (
  group_name character varying(50) NOT NULL
);

/* QA Check Review */
CREATE TABLE qa_check_review (
  process_id character varying(50) NOT NULL,
  reviewed_by character varying NOT NULL,
  num_of_checks integer NOT NULL,
  form_type character varying(20) NOT NULL,
  comment character varying(255) NULL,
  time_reviewed timestamp with time zone NOT NULL
);

/* QA Product Check */
CREATE TABLE qa_product_check (
  checked_by character varying NOT NULL,
  production_line character varying(50) NOT NULL,
  belt_condition character varying(10) NOT NULL,
  product_id character varying(20) NOT NULL,
  product_description character varying(50) NOT NULL,
  "check" jsonb NOT NULL,
  is_manual boolean NOT NULL,
  check_count integer NOT NULL,
  id character varying(60) NOT NULL,
  process_id character varying(50) NOT NULL,
  num_of_mat_out_of_range integer NOT NULL,
  time_checked timestamp with time zone NOT NULL,
  order_id character varying NULL
);

ALTER TABLE qa_product_check ADD CONSTRAINT qa_product_check_pkey PRIMARY KEY (id);

/* Reason Code */
CREATE TABLE reason_code (
  category_id character varying NULL,
  reason_id character varying NULL,
  parent_reason_id character varying NULL
);

/* Route */
CREATE TABLE route (
  id SERIAL,
  name character varying NOT NULL,
  setup_time_minutes bigint NULL,
  rate_per_mintue double precision NULL,
  efficiency_rate double precision NULL
);

ALTER TABLE route ADD CONSTRAINT route_pkey PRIMARY KEY (id);