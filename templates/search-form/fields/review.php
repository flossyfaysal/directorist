<?php
/**
 * @author  wpWax
 * @since   6.6
 * @version 6.7
 */

if ( ! defined( 'ABSPATH' ) ) exit;
?>

<div class="directorist-search-field  directorist-flex directorist-align-center">

	<?php if ( !empty($data['label']) ): ?>
		<label><?php echo esc_html( $data['label'] ); ?></label>
	<?php endif; ?>
	<div class="directorist-select" id="directorist-select">
		<select name='search_by_rating' <?php echo ! empty( $data['required'] ) ? 'required="required"' : ''; ?>>
			<?php
				foreach ( $searchform->rating_field_data() as $option ) {
					printf('<option value="%s"%s>%s</option>', $option['value'], $option['selected'], $option['label']);
				}
			?>
		</select>
	</div>
</div>